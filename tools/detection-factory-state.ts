import { tool } from "@opencode-ai/plugin"
import { spawnSync } from "node:child_process"
import { createHash, randomUUID } from "node:crypto"
import {
  chmodSync,
  closeSync,
  constants,
  existsSync,
  fstatSync,
  fsyncSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  readlinkSync,
  readdirSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs"
import { dirname, join, relative, resolve } from "node:path"

const OPENCODE_TMP_ROOT = "/tmp/opencode"
const STATE_ROOT = join(OPENCODE_TMP_ROOT, "detection-factory")
const MAX_CONTENT_BYTES = 256 * 1024
const MAX_CHANGED_FILE_BYTES = 16 * 1024 * 1024
const MAX_GIT_OUTPUT_BYTES = 4 * 1024 * 1024
const MAX_METADATA_FILE_BYTES = 2 * 1024 * 1024
const MAX_METADATA_POLICY_BYTES = 4096
const MAX_METADATA_REQUEST_BYTES = 8192
const MAX_COMMIT_MESSAGE_BYTES = 512
const RUN_ID = /^\d{8}T\d{6}Z-[a-z0-9][a-z0-9-]{0,80}$/
const COMMIT_ID = /^[0-9a-f]{40,64}$/
const METADATA_PATH = /^[A-Za-z0-9._/-]+\.ya?ml$/
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
const METADATA_POLICY_PATH = ".detection-factory.json"
const CONTROLLERS = new Set(["detection-factory-cloud", "detection-factory-local"])
const SAFE_GIT_ENV = {
  PATH: "/usr/local/bin:/usr/bin:/bin",
  HOME: "/nonexistent",
  XDG_CONFIG_HOME: "/nonexistent",
  GIT_CONFIG_GLOBAL: "/dev/null",
  GIT_CONFIG_NOSYSTEM: "1",
  GIT_TERMINAL_PROMPT: "0",
  LANG: "C.UTF-8",
  LC_ALL: "C.UTF-8",
}

type StateKind = "checkpoint" | "pr"
type MetadataField = "id" | "owner"

type TopLevelField = {
  key: string
  line_start: number
  line_end: number
  value_start: number
  value_end: number
  raw_value: string
}

function sha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex")
}

function decodeUtf8(value: Buffer, label: string): string {
  if (value.length >= 3 && value[0] === 0xef && value[1] === 0xbb && value[2] === 0xbf) {
    throw new Error(`${label} must not contain a UTF-8 BOM`)
  }
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(value)
  } catch {
    throw new Error(`${label} is not valid UTF-8`)
  }
}

function readRegularFileNoFollow(path: string, maxBytes: number, label: string): Buffer {
  let descriptor: number | null = null
  try {
    descriptor = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW)
    const stat = fstatSync(descriptor)
    if (!stat.isFile() || stat.size > maxBytes) throw new Error(`${label} must be a small regular file`)
    return readFileSync(descriptor)
  } finally {
    if (descriptor !== null) closeSync(descriptor)
  }
}

function topLevelFields(content: string, key: string): TopLevelField[] {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const expression = new RegExp(`^${escaped}:([^\\r\\n]*)(?:\\r?\\n|$)`, "gm")
  return [...content.matchAll(expression)].map((match) => {
    const lineStart = match.index ?? 0
    const rawValue = match[1]
    const valueStart = lineStart + key.length + 1
    return {
      key,
      line_start: lineStart,
      line_end: lineStart + match[0].length,
      value_start: valueStart,
      value_end: valueStart + rawValue.length,
      raw_value: rawValue,
    }
  })
}

function uniqueTopLevelField(content: string, key: string): TopLevelField {
  const fields = topLevelFields(content, key)
  if (fields.length !== 1) {
    throw new Error(`Rule must contain exactly one top-level ${key} field; found ${fields.length}`)
  }
  return fields[0]
}

function parseScalar(raw: string): { empty: boolean; value: string } {
  const doubleQuoted = raw.match(/^\s*("(?:[^"\\]|\\.)*")\s*(?:#.*)?$/)
  if (doubleQuoted) {
    try {
      const value = JSON.parse(doubleQuoted[1])
      if (typeof value !== "string") throw new Error("not a string")
      return { empty: value.length === 0, value }
    } catch {
      throw new Error("Metadata scalar contains invalid double-quoted syntax")
    }
  }

  const singleQuoted = raw.match(/^\s*'((?:[^']|'')*)'\s*(?:#.*)?$/)
  if (singleQuoted) {
    const value = singleQuoted[1].replaceAll("''", "'")
    return { empty: value.length === 0, value }
  }

  if (/^\s*(?:#.*)?$/.test(raw)) return { empty: true, value: "" }

  const plain = raw.match(/^\s*([^#]*?)(?:\s+#.*)?$/)
  if (!plain) throw new Error("Metadata scalar uses unsupported YAML syntax")
  const value = plain[1].trim()
  return { empty: value.length === 0, value }
}

function renderEmptyScalar(raw: string, value: string): string {
  const doubleQuoted = raw.match(/^(\s*)""(\s*(?:#.*)?)$/)
  if (doubleQuoted) return `${doubleQuoted[1]}${JSON.stringify(value)}${doubleQuoted[2]}`

  const singleQuoted = raw.match(/^(\s*)''(\s*(?:#.*)?)$/)
  if (singleQuoted) return `${singleQuoted[1]}'${value.replaceAll("'", "''")}'${singleQuoted[2]}`

  const blank = raw.match(/^(\s*)(#.*)?$/)
  if (blank) {
    const comment = blank[2] ? ` ${blank[2]}` : ""
    return `${blank[1]}${JSON.stringify(value)}${comment}`
  }
  throw new Error("Requested metadata field is not an empty scalar")
}

function normalizedMetadata(content: string, fields: MetadataField[]): string {
  const ranges = fields
    .map((field) => uniqueTopLevelField(content, field))
    .sort((left, right) => right.value_start - left.value_start)
  let normalized = content
  for (const range of ranges) {
    normalized = `${normalized.slice(0, range.value_start)}<detection-factory-metadata>${normalized.slice(range.value_end)}`
  }
  return normalized
}

function topLevelBlock(content: string, key: string): string {
  const field = uniqueTopLevelField(content, key)
  const expression = /^[A-Za-z_][A-Za-z0-9_-]*:/gm
  expression.lastIndex = field.line_end
  const next = expression.exec(content)
  return content.slice(field.line_start, next?.index ?? content.length)
}

function normalizedMetadataFields(fields: MetadataField[] | undefined): MetadataField[] {
  if (!fields || fields.length === 0) throw new Error("requested_fields must contain id and/or owner")
  const normalized = [...new Set(fields)].sort() as MetadataField[]
  if (normalized.length !== fields.length || normalized.some((field) => field !== "id" && field !== "owner")) {
    throw new Error("requested_fields must contain unique id and/or owner entries")
  }
  return normalized
}

function validateOwner(value: string): string {
  if (!value || value.trim() !== value || value.length > 256 || /[\u0000-\u001f\u007f]/.test(value)) {
    throw new Error("Owner must be a non-empty trimmed scalar of at most 256 characters")
  }
  return value
}

function currentUid(): number | null {
  return typeof process.getuid === "function" ? process.getuid() : null
}

function assertOwnedDirectory(path: string) {
  const stat = lstatSync(path)
  if (stat.isSymbolicLink() || !stat.isDirectory()) {
    throw new Error(`Unsafe state directory: ${path}`)
  }
  const uid = currentUid()
  if (uid !== null && stat.uid !== uid) {
    throw new Error(`State directory is not owned by the current user: ${path}`)
  }
  chmodSync(path, 0o700)
}

function ensureOwnedDirectory(path: string) {
  try {
    mkdirSync(path, { mode: 0o700 })
  } catch (error) {
    if (!(error instanceof Error) || !("code" in error) || error.code !== "EEXIST") throw error
  }
  assertOwnedDirectory(path)
}

function ensureRoot() {
  ensureOwnedDirectory(OPENCODE_TMP_ROOT)
  ensureOwnedDirectory(STATE_ROOT)
}

function assertSafeFile(path: string) {
  const stat = lstatSync(path)
  if (stat.isSymbolicLink() || !stat.isFile()) throw new Error(`Unsafe state file: ${path}`)
  const uid = currentUid()
  if (uid !== null && stat.uid !== uid) {
    throw new Error(`State file is not owned by the current user: ${path}`)
  }
  return stat
}

function statePath(runId: string, kind: StateKind): string {
  if (!RUN_ID.test(runId)) throw new Error("Invalid detection-factory run_id")
  return join(STATE_ROOT, `${runId}${kind === "pr" ? "-pr.md" : ".yaml"}`)
}

function writeAtomic(path: string, content: string, kind: StateKind) {
  const bytes = Buffer.byteLength(content, "utf8")
  if (bytes > MAX_CONTENT_BYTES) {
    throw new Error(`State content exceeds ${MAX_CONTENT_BYTES} bytes`)
  }
  if (content.includes("\0")) throw new Error("State content contains a NUL byte")
  if (kind === "checkpoint" && checkpointScalarValue(content, "contract_version") !== "1") {
    throw new Error("Checkpoint must contain exactly one top-level contract_version: 1")
  }
  if (existsSync(path)) assertSafeFile(path)

  const temporary = `${path}.${randomUUID()}.tmp`
  let descriptor: number | null = null
  try {
    descriptor = openSync(temporary, "wx", 0o600)
    writeFileSync(descriptor, content, { encoding: "utf8" })
    fsyncSync(descriptor)
    closeSync(descriptor)
    descriptor = null
    renameSync(temporary, path)
    chmodSync(path, 0o600)
  } finally {
    if (descriptor !== null) closeSync(descriptor)
    if (existsSync(temporary)) unlinkSync(temporary)
  }

  return {
    path,
    bytes,
    sha256: createHash("sha256").update(content).digest("hex"),
  }
}

function runGit(worktree: string, args: string[]): Buffer {
  const result = spawnSync("git", args, {
    cwd: worktree,
    encoding: "buffer",
    maxBuffer: MAX_GIT_OUTPUT_BYTES,
    shell: false,
    env: SAFE_GIT_ENV,
  })
  if (result.error) throw result.error
  if (result.status !== 0) {
    const detail = result.stderr.toString("utf8").replace(/[\r\n\t]+/g, " ").slice(0, 300)
    throw new Error(`Git command failed (${args[0]}): ${detail}`)
  }
  return result.stdout
}

function identifierExistsAtBase(worktree: string, baseCommit: string, identifier: string): boolean {
  const result = spawnSync(
    "git",
    ["grep", "-F", "-l", identifier, baseCommit, "--", "*.yaml", "*.yml"],
    {
      cwd: worktree,
      encoding: "buffer",
      maxBuffer: MAX_GIT_OUTPUT_BYTES,
      shell: false,
      env: SAFE_GIT_ENV,
    },
  )
  if (result.error) throw result.error
  if (result.status === 1) return false
  if (result.status !== 0) throw new Error("Could not verify generated metadata identifier uniqueness")
  return true
}

function safeMetadataPath(worktree: string, path: string): string {
  if (
    !METADATA_PATH.test(path) ||
    path.startsWith("/") ||
    path.includes("//") ||
    path.split("/").some((part) => part === "." || part === "..")
  ) {
    throw new Error("Metadata fast path requires one safe relative YAML path")
  }
  return validateRelativePath(worktree, path)
}

function baseBlob(worktree: string, baseCommit: string, path: string, maxBytes: number): Buffer {
  const record = runGit(worktree, ["ls-tree", "-z", baseCommit, "--", path])
  if (record.length === 0) throw new Error(`Tracked base file does not exist: ${path}`)
  const value = record.toString("utf8").replace(/\0$/, "")
  const tab = value.indexOf("\t")
  if (tab === -1 || value.slice(tab + 1) !== path) throw new Error(`Unexpected base tree entry: ${path}`)
  const [mode, type] = value.slice(0, tab).split(" ")
  if (type !== "blob" || !["100644", "100755"].includes(mode)) {
    throw new Error(`Metadata source is not a regular tracked file: ${path}`)
  }
  const content = runGit(worktree, ["show", `${baseCommit}:${path}`])
  if (content.length > maxBytes) throw new Error(`Metadata source exceeds ${maxBytes} bytes: ${path}`)
  return content
}

function canonicalOwnerAtBase(worktree: string, baseCommit: string) {
  const content = baseBlob(worktree, baseCommit, METADATA_POLICY_PATH, MAX_METADATA_POLICY_BYTES)
  const text = decodeUtf8(content, METADATA_POLICY_PATH)
  const strictPolicy = /^\s*\{\s*"metadata"\s*:\s*\{\s*"canonicalOwner"\s*:\s*("(?:[^"\\]|\\.)*")\s*\}\s*\}\s*$/s
  const match = text.match(strictPolicy)
  if (!match) {
    throw new Error(
      `${METADATA_POLICY_PATH} must contain only {"metadata":{"canonicalOwner":"..."}}`,
    )
  }
  let owner: unknown
  try {
    owner = JSON.parse(match[1])
  } catch {
    throw new Error(`${METADATA_POLICY_PATH} contains an invalid canonicalOwner string`)
  }
  if (typeof owner !== "string") throw new Error(`${METADATA_POLICY_PATH} canonicalOwner must be a string`)
  return {
    owner: validateOwner(owner),
    path: METADATA_POLICY_PATH,
    sha256: sha256(content),
  }
}

function metadataProof(baseContent: string, resultContent: string, fields: MetadataField[]) {
  const normalizedBase = normalizedMetadata(baseContent, fields)
  const normalizedResult = normalizedMetadata(resultContent, fields)
  const baseQuery = topLevelBlock(baseContent, "query")
  const resultQuery = topLevelBlock(resultContent, "query")
  const baseTestblock = topLevelBlock(baseContent, "testblock")
  const resultTestblock = topLevelBlock(resultContent, "testblock")
  const proof = {
    base_blob_sha256: sha256(baseContent),
    result_blob_sha256: sha256(resultContent),
    base_non_metadata_sha256: sha256(normalizedBase),
    result_non_metadata_sha256: sha256(normalizedResult),
    base_query_sha256: sha256(baseQuery),
    result_query_sha256: sha256(resultQuery),
    base_testblock_sha256: sha256(baseTestblock),
    result_testblock_sha256: sha256(resultTestblock),
  }
  return {
    ...proof,
    non_metadata_unchanged: proof.base_non_metadata_sha256 === proof.result_non_metadata_sha256,
    query_unchanged: proof.base_query_sha256 === proof.result_query_sha256,
    testblock_unchanged: proof.base_testblock_sha256 === proof.result_testblock_sha256,
  }
}

function atomicWorktreeWrite(path: string, content: string) {
  const current = lstatSync(path)
  if (current.isSymbolicLink() || !current.isFile()) throw new Error("Metadata target is not a regular file")
  const temporary = join(dirname(path), `.${randomUUID()}.detection-factory.tmp`)
  let descriptor: number | null = null
  try {
    descriptor = openSync(temporary, "wx", current.mode & 0o777)
    writeFileSync(descriptor, content, { encoding: "utf8" })
    fsyncSync(descriptor)
    closeSync(descriptor)
    descriptor = null
    chmodSync(temporary, current.mode & 0o777)
    renameSync(temporary, path)
  } finally {
    if (descriptor !== null) closeSync(descriptor)
    if (existsSync(temporary)) unlinkSync(temporary)
  }
}

function metadataBaseline(worktree: string, baseCommit: string, targetPath: string) {
  if (!COMMIT_ID.test(baseCommit)) throw new Error("base_commit must be a full hexadecimal commit ID")
  runGit(worktree, ["cat-file", "-e", `${baseCommit}^{commit}`])
  const head = runGit(worktree, ["rev-parse", "HEAD"]).toString("utf8").trim()
  if (head !== baseCommit) throw new Error(`Current HEAD ${head} does not equal base commit ${baseCommit}`)
  const status = runGit(worktree, ["status", "--porcelain=v1", "-z", "--untracked-files=all"])
  if (status.length > 0) throw new Error("Metadata fast path requires a clean worktree")

  const absolute = safeMetadataPath(worktree, targetPath)
  const base = baseBlob(worktree, baseCommit, targetPath, MAX_METADATA_FILE_BYTES)
  const current = readRegularFileNoFollow(absolute, MAX_METADATA_FILE_BYTES, "Metadata target")
  if (!base.equals(current)) throw new Error("Metadata target differs from the recorded base commit")
  const text = decodeUtf8(base, targetPath)
  for (const key of ["id", "owner", "query", "testblock"]) uniqueTopLevelField(text, key)
  if ((text.match(/^---\s*$/gm) ?? []).length > 1) {
    throw new Error("Multi-document YAML is not eligible for metadata fast path")
  }
  return { absolute, text, base }
}

function resolveMetadataOwner(
  worktree: string,
  baseCommit: string,
  fields: MetadataField[],
  ownerValue: string | undefined,
  requestText: string | undefined,
) {
  if (!fields.includes("owner")) return null
  if (ownerValue !== undefined) {
    const owner = validateOwner(ownerValue)
    if (!requestText || Buffer.byteLength(requestText, "utf8") > MAX_METADATA_REQUEST_BYTES) {
      throw new Error("Explicit owner resolution requires a bounded request_text")
    }
    if (!requestText.includes(owner)) throw new Error("Explicit owner value is not present in request_text")
    return { owner, source: "request", path: null, sha256: sha256(requestText) }
  }
  const policy = canonicalOwnerAtBase(worktree, baseCommit)
  return { owner: policy.owner, source: "repository_policy", path: policy.path, sha256: policy.sha256 }
}

function inspectMetadataRequest(
  worktree: string,
  baseCommit: string,
  targetPath: string,
  requestedFields: MetadataField[] | undefined,
  ownerValue: string | undefined,
  requestText: string | undefined,
) {
  const fields = normalizedMetadataFields(requestedFields)
  const baseline = metadataBaseline(worktree, baseCommit, targetPath)
  for (const field of fields) {
    const fieldRecord = uniqueTopLevelField(baseline.text, field)
    const scalar = parseScalar(fieldRecord.raw_value)
    if (!scalar.empty) throw new Error(`Requested top-level ${field} field is not empty`)
    if (/[ \t]+$/.test(fieldRecord.raw_value)) {
      throw new Error(`Requested top-level ${field} line contains trailing whitespace`)
    }
  }
  const owner = resolveMetadataOwner(worktree, baseCommit, fields, ownerValue, requestText)
  return {
    fields,
    baseline,
    owner,
    proof: metadataProof(baseline.text, baseline.text, fields),
  }
}

function validateRelativePath(worktree: string, path: string): string {
  if (!path || path.includes("\0")) throw new Error("Invalid changed path")
  const absolute = resolve(worktree, path)
  const fromRoot = relative(resolve(worktree), absolute)
  if (fromRoot === ".." || fromRoot.startsWith("../") || resolve(worktree) === absolute) {
    throw new Error(`Changed path escapes the worktree: ${path}`)
  }
  return absolute
}

function changedPaths(status: Buffer): string[] {
  const entries = status.toString("utf8").split("\0").filter(Boolean)
  const paths = new Set<string>()
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index]
    if (entry.length < 4) throw new Error("Unexpected git status entry")
    const code = entry.slice(0, 2)
    paths.add(entry.slice(3))
    if (code.includes("R") || code.includes("C")) {
      index += 1
      if (index >= entries.length) throw new Error("Incomplete renamed-path status entry")
      paths.add(entries[index])
    }
  }
  return [...paths].sort()
}

function hashObject(worktree: string, path: string, content: Buffer, applyFilters: boolean): string {
  const filterArgument = applyFilters ? `--path=${path}` : "--no-filters"
  const result = spawnSync("git", ["hash-object", filterArgument, "--stdin"], {
    cwd: worktree,
    input: content,
    encoding: "utf8",
    maxBuffer: 1024 * 1024,
    timeout: 30_000,
    shell: false,
    env: SAFE_GIT_ENV,
  })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(`Could not hash changed file: ${path}`)
  return result.stdout.trim()
}

function fingerprintDescriptors(baseCommit: string, descriptors: Array<[string, string]>): string {
  const hash = createHash("sha256")
  hash.update("detection-factory-diff-v2\0")
  hash.update(baseCommit)
  for (const [path, descriptor] of descriptors) {
    hash.update("\0path\0")
    hash.update(path)
    hash.update("\0object\0")
    hash.update(descriptor)
  }
  return hash.digest("hex")
}

function worktreeContentFingerprint(worktree: string, baseCommit: string, paths: string[]): string {
  const descriptors: Array<[string, string]> = []
  for (const path of paths) {
    const absolute = validateRelativePath(worktree, path)
    if (!existsSync(absolute)) {
      descriptors.push([path, "deleted"])
      continue
    }

    const stat = lstatSync(absolute)
    if (stat.isSymbolicLink()) {
      const content = Buffer.from(readlinkSync(absolute), "utf8")
      descriptors.push([path, `120000:${hashObject(worktree, path, content, false)}`])
      continue
    }
    if (!stat.isFile()) throw new Error(`Changed path is not a regular file: ${path}`)
    if (stat.size > MAX_CHANGED_FILE_BYTES) {
      throw new Error(`Changed file exceeds ${MAX_CHANGED_FILE_BYTES} bytes: ${path}`)
    }
    const mode = stat.mode & 0o111 ? "100755" : "100644"
    descriptors.push([path, `${mode}:${hashObject(worktree, path, readFileSync(absolute), true)}`])
  }
  return fingerprintDescriptors(baseCommit, descriptors)
}

function committedContentFingerprint(
  worktree: string,
  baseCommit: string,
  commit: string,
  paths: string[],
): string {
  const descriptors: Array<[string, string]> = []
  for (const path of paths) {
    validateRelativePath(worktree, path)
    const record = runGit(worktree, ["ls-tree", "-z", commit, "--", path])
    if (record.length === 0) {
      descriptors.push([path, "deleted"])
      continue
    }
    const value = record.toString("utf8").replace(/\0$/, "")
    const tab = value.indexOf("\t")
    if (tab === -1) throw new Error(`Unexpected committed tree entry: ${path}`)
    const [mode, type, object] = value.slice(0, tab).split(" ")
    if (type !== "blob" || !mode || !object) throw new Error(`Unsupported committed tree entry: ${path}`)
    descriptors.push([path, `${mode}:${object}`])
  }
  return fingerprintDescriptors(baseCommit, descriptors)
}

function worktreeFingerprint(worktree: string, baseCommit: string) {
  if (!COMMIT_ID.test(baseCommit)) throw new Error("base_commit must be a full hexadecimal commit ID")
  runGit(worktree, ["cat-file", "-e", `${baseCommit}^{commit}`])
  const head = runGit(worktree, ["rev-parse", "HEAD"]).toString("utf8").trim()
  if (head !== baseCommit) {
    throw new Error(`Current HEAD ${head} does not equal the reviewed base commit ${baseCommit}`)
  }

  const status = runGit(worktree, ["status", "--porcelain=v1", "-z", "--untracked-files=all"])
  const paths = changedPaths(status)
  const branch = runGit(worktree, ["branch", "--show-current"]).toString("utf8").trim()
  return {
    fingerprint: worktreeContentFingerprint(worktree, baseCommit, paths),
    paths_sha256: pathsFingerprint(paths),
    changed_paths: paths,
    branch,
    head,
  }
}

function samePaths(actual: string[], expected: string[]): boolean {
  const normalized = [...new Set(expected)].sort()
  return actual.length === normalized.length && actual.every((path, index) => path === normalized[index])
}

function checkpointScalarValue(content: string, field: string): string {
  const values = topLevelFields(content, field)
  if (values.length !== 1) {
    throw new Error(`Checkpoint must contain exactly one top-level ${field} field`)
  }
  return parseScalar(values[0].raw_value).value
}

function pathsFingerprint(paths: string[]): string {
  return createHash("sha256").update([...new Set(paths)].sort().join("\0")).digest("hex")
}

function assertPublishCheckpoint(
  runId: string,
  expectedFingerprint: string,
  expectedBranch: string,
  expectedBaseCommit: string,
  expectedPaths: string[],
  reviewHandoffId: string,
) {
  const checkpoint = statePath(runId, "checkpoint")
  const stat = assertSafeFile(checkpoint)
  if (stat.size > MAX_CONTENT_BYTES) throw new Error("Checkpoint exceeds the state size limit")
  const content = readFileSync(checkpoint, "utf8")
  if (checkpointScalarValue(content, "stage") !== "publish") throw new Error("Checkpoint is not at publish stage")
  const contractType = checkpointScalarValue(content, "publish_contract_type")
  if (!["ReviewHandoff", "MetadataReviewHandoff"].includes(contractType)) {
    throw new Error("Checkpoint publish binding is not a supported review handoff")
  }
  const verdict = checkpointScalarValue(content, "publish_verdict")
  const publishable =
    contractType === "MetadataReviewHandoff"
      ? verdict === "pass"
      : ["pass", "pass_with_warnings", "blocked"].includes(verdict)
  if (!publishable) throw new Error("Checkpoint does not contain a publishable review verdict")
  if (checkpointScalarValue(content, "publish_review_handoff_id") !== reviewHandoffId) {
    throw new Error("Checkpoint is not bound to the expected ReviewHandoff")
  }
  if (checkpointScalarValue(content, "publish_diff_fingerprint") !== expectedFingerprint) {
    throw new Error("Checkpoint is not bound to the expected diff fingerprint")
  }
  if (checkpointScalarValue(content, "publish_work_branch") !== expectedBranch) {
    throw new Error("Checkpoint is not bound to the expected work branch")
  }
  if (checkpointScalarValue(content, "publish_base_commit") !== expectedBaseCommit) {
    throw new Error("Checkpoint is not bound to the expected base commit")
  }
  if (checkpointScalarValue(content, "publish_paths_sha256") !== pathsFingerprint(expectedPaths)) {
    throw new Error("Checkpoint is not bound to the expected reviewed paths")
  }
}

function nulPaths(value: Buffer): string[] {
  return value.toString("utf8").split("\0").filter(Boolean).sort()
}

function committedFingerprint(worktree: string, baseCommit: string, expectedPaths: string[]) {
  const head = runGit(worktree, ["rev-parse", "HEAD"]).toString("utf8").trim()
  const commitLine = runGit(worktree, ["rev-list", "--parents", "-n", "1", head])
    .toString("utf8")
    .trim()
    .split(/\s+/)
  if (commitLine.length !== 2 || commitLine[1] !== baseCommit) {
    throw new Error("Published commit must be exactly one child of the reviewed base commit")
  }
  const status = runGit(worktree, ["status", "--porcelain=v1", "-z", "--untracked-files=all"])
  if (status.length > 0) throw new Error("Worktree is not clean after commit")
  const paths = nulPaths(
    runGit(worktree, ["diff-tree", "--no-commit-id", "--name-only", "-r", "-z", head]),
  )
  if (!samePaths(paths, expectedPaths)) throw new Error("Committed paths differ from reviewed paths")
  const branch = runGit(worktree, ["branch", "--show-current"]).toString("utf8").trim()
  return {
    fingerprint: committedContentFingerprint(worktree, baseCommit, head, paths),
    paths_sha256: pathsFingerprint(paths),
    changed_paths: paths,
    branch,
    head,
  }
}

export default tool({
  description:
    "Persist detection-factory state, prepare strictly bounded metadata edits, fingerprint the worktree, and stage only an unchanged independently reviewed diff.",
  args: {
    action: tool.schema.enum([
      "list",
      "read",
      "write",
      "probe_metadata",
      "prepare_metadata",
      "fingerprint",
      "stage_reviewed",
      "commit_reviewed",
      "verify_commit",
    ]),
    kind: tool.schema.enum(["checkpoint", "pr"]).optional(),
    run_id: tool.schema.string().optional(),
    content: tool.schema.string().optional(),
    base_commit: tool.schema.string().optional(),
    target_path: tool.schema.string().optional(),
    requested_fields: tool.schema.array(tool.schema.enum(["id", "owner"])).optional(),
    owner_value: tool.schema.string().optional(),
    request_text: tool.schema.string().optional(),
    expected_fingerprint: tool.schema.string().optional(),
    expected_paths: tool.schema.array(tool.schema.string()).optional(),
    expected_branch: tool.schema.string().optional(),
    review_handoff_id: tool.schema.string().optional(),
    commit_message: tool.schema.string().optional(),
  },
  async execute(args, context) {
    try {
      if (!CONTROLLERS.has(context.agent)) {
        return "Request rejected: only a detection-factory controller may use this tool."
      }
      ensureRoot()

      if (args.action === "list") {
        const entries = readdirSync(STATE_ROOT)
          .filter((name) => name.endsWith(".yaml") || name.endsWith("-pr.md"))
          .map((name) => {
            const path = join(STATE_ROOT, name)
            const stat = assertSafeFile(path)
            return { name, bytes: stat.size, modified: stat.mtime.toISOString() }
          })
          .sort((left, right) => right.modified.localeCompare(left.modified))
        return JSON.stringify(entries, null, 2)
      }

      if (!args.run_id || !RUN_ID.test(args.run_id)) {
        return "Request rejected: operation requires a valid run_id."
      }

      if (args.action === "probe_metadata" || args.action === "prepare_metadata") {
        if (!args.base_commit || !args.target_path || !args.requested_fields) {
          return "Request rejected: metadata operations require base_commit, target_path, and requested_fields."
        }
        const checkpointPath = statePath(args.run_id, "checkpoint")
        const checkpointStat = assertSafeFile(checkpointPath)
        if (checkpointStat.size > MAX_CONTENT_BYTES) throw new Error("Checkpoint exceeds the state size limit")
        const checkpoint = readFileSync(checkpointPath, "utf8")
        const requiredStage = args.action === "probe_metadata" ? "metadata_probe" : "metadata_prepare"
        const currentStage = checkpointScalarValue(checkpoint, "stage")
        if (currentStage !== requiredStage) {
          return `Request rejected: ${args.action} requires checkpoint stage ${requiredStage}; current stage is ${currentStage}.`
        }

        if (args.action === "probe_metadata") {
          try {
            const inspection = inspectMetadataRequest(
              context.worktree,
              args.base_commit,
              args.target_path,
              args.requested_fields as MetadataField[],
              args.owner_value,
              args.request_text,
            )
            return JSON.stringify(
              {
                eligible: true,
                target_path: args.target_path,
                requested_fields: inspection.fields,
                owner_resolution: inspection.owner,
                base_blob_sha256: inspection.proof.base_blob_sha256,
                non_metadata_sha256: inspection.proof.base_non_metadata_sha256,
                query_sha256: inspection.proof.base_query_sha256,
                testblock_sha256: inspection.proof.base_testblock_sha256,
              },
              null,
              2,
            )
          } catch (error) {
            const reason = error instanceof Error ? error.message : "Unknown metadata eligibility error"
            return JSON.stringify({ eligible: false, reason }, null, 2)
          }
        }

        if (!args.expected_branch) {
          return "Request rejected: prepare_metadata requires expected_branch."
        }
        const inspection = inspectMetadataRequest(
          context.worktree,
          args.base_commit,
          args.target_path,
          args.requested_fields as MetadataField[],
          args.owner_value,
          args.request_text,
        )
        const branch = runGit(context.worktree, ["branch", "--show-current"]).toString("utf8").trim()
        if (!branch || branch !== args.expected_branch) {
          throw new Error(`Current branch ${branch || "<detached>"} does not equal expected branch ${args.expected_branch}`)
        }

        const values: Partial<Record<MetadataField, string>> = {}
        if (inspection.fields.includes("id")) {
          let identifier = randomUUID()
          for (let attempt = 0; attempt < 3 && identifierExistsAtBase(context.worktree, args.base_commit, identifier); attempt += 1) {
            identifier = randomUUID()
          }
          if (!UUID_V4.test(identifier) || identifierExistsAtBase(context.worktree, args.base_commit, identifier)) {
            throw new Error("Could not generate a unique RFC 4122 UUID v4")
          }
          values.id = identifier
        }
        if (inspection.fields.includes("owner")) {
          if (!inspection.owner) throw new Error("Owner resolution is missing")
          values.owner = inspection.owner.owner
        }

        const replacements = inspection.fields
          .map((field) => {
            const range = uniqueTopLevelField(inspection.baseline.text, field)
            const value = values[field]
            if (!value) throw new Error(`Prepared value is missing for ${field}`)
            return { range, rendered: renderEmptyScalar(range.raw_value, value) }
          })
          .sort((left, right) => right.range.value_start - left.range.value_start)
        let result = inspection.baseline.text
        for (const replacement of replacements) {
          result = `${result.slice(0, replacement.range.value_start)}${replacement.rendered}${result.slice(replacement.range.value_end)}`
        }

        for (const field of inspection.fields) {
          const current = parseScalar(uniqueTopLevelField(result, field).raw_value)
          if (current.empty || current.value !== values[field]) {
            throw new Error(`Prepared ${field} value failed scalar verification`)
          }
        }
        const proof = metadataProof(inspection.baseline.text, result, inspection.fields)
        if (!proof.non_metadata_unchanged || !proof.query_unchanged || !proof.testblock_unchanged) {
          throw new Error("Prepared metadata edit changed non-metadata rule content")
        }

        atomicWorktreeWrite(inspection.baseline.absolute, result)
        const current = worktreeFingerprint(context.worktree, args.base_commit)
        if (!samePaths(current.changed_paths, [args.target_path])) {
          throw new Error("Prepared metadata edit changed an unexpected path")
        }
        runGit(context.worktree, [
          "-c",
          "core.whitespace=cr-at-eol",
          "diff",
          "--check",
          args.base_commit,
          "--",
          args.target_path,
        ])
        return JSON.stringify(
          {
            prepared: true,
            target_path: args.target_path,
            requested_fields: inspection.fields,
            values,
            owner_resolution: inspection.owner,
            proof,
            ...current,
          },
          null,
          2,
        )
      }

      if (args.action === "fingerprint" || args.action === "stage_reviewed") {
        if (!args.base_commit) return "Request rejected: diff operations require base_commit."
        assertSafeFile(statePath(args.run_id, "checkpoint"))
        const current = worktreeFingerprint(context.worktree, args.base_commit)
        const fingerprintMatches = args.expected_fingerprint
          ? current.fingerprint === args.expected_fingerprint
          : null
        const pathsMatch = args.expected_paths ? samePaths(current.changed_paths, args.expected_paths) : null
        const branchMatches = args.expected_branch ? current.branch === args.expected_branch : null

        if (args.action === "fingerprint") {
          return JSON.stringify(
            {
              ...current,
              fingerprint_matches: fingerprintMatches,
              paths_match: pathsMatch,
              branch_matches: branchMatches,
            },
            null,
            2,
          )
        }

        if (!args.expected_fingerprint || !args.expected_paths || !args.expected_branch || !args.review_handoff_id) {
          return "Request rejected: stage_reviewed requires expected_fingerprint, expected_paths, expected_branch, and review_handoff_id."
        }
        if (!args.review_handoff_id.startsWith(`${args.run_id}:review-`)) {
          return "Request rejected: review_handoff_id does not belong to this run."
        }
        if (!fingerprintMatches || !pathsMatch || !branchMatches) {
          return JSON.stringify(
            {
              staged: false,
              ...current,
              fingerprint_matches: fingerprintMatches,
              paths_match: pathsMatch,
              branch_matches: branchMatches,
            },
            null,
            2,
          )
        }
        assertPublishCheckpoint(
          args.run_id,
          args.expected_fingerprint,
          args.expected_branch,
          args.base_commit,
          args.expected_paths,
          args.review_handoff_id,
        )
        for (const path of args.expected_paths) validateRelativePath(context.worktree, path)
        runGit(context.worktree, ["add", "--", ...args.expected_paths])
        const afterStage = worktreeFingerprint(context.worktree, args.base_commit)
        const unstaged = nulPaths(runGit(context.worktree, ["diff", "--name-only", "-z", "--"]))
        const untracked = nulPaths(
          runGit(context.worktree, ["ls-files", "--others", "--exclude-standard", "-z"]),
        )
        const staged = nulPaths(
          runGit(context.worktree, ["diff", "--cached", "--name-only", "-z", args.base_commit, "--"]),
        )
        if (
          afterStage.fingerprint !== args.expected_fingerprint ||
          !samePaths(afterStage.changed_paths, args.expected_paths) ||
          unstaged.length > 0 ||
          untracked.length > 0 ||
          !samePaths(staged, args.expected_paths)
        ) {
          throw new Error("Worktree or index changed while staging the reviewed diff")
        }
        return JSON.stringify({ staged: true, ...afterStage, staged_paths: staged }, null, 2)
      }

      if (args.action === "commit_reviewed") {
        if (
          !args.base_commit ||
          !args.expected_fingerprint ||
          !args.expected_paths ||
          !args.expected_branch ||
          !args.review_handoff_id ||
          !args.commit_message
        ) {
          return "Request rejected: commit_reviewed requires the complete reviewed publish binding and commit_message."
        }
        if (!args.review_handoff_id.startsWith(`${args.run_id}:review-`)) {
          return "Request rejected: review_handoff_id does not belong to this run."
        }
        if (
          args.commit_message.trim() !== args.commit_message ||
          /[\u0000-\u001f\u007f]/.test(args.commit_message) ||
          Buffer.byteLength(args.commit_message, "utf8") > MAX_COMMIT_MESSAGE_BYTES
        ) {
          return "Request rejected: commit_message must be a trimmed single line of at most 512 bytes."
        }
        assertPublishCheckpoint(
          args.run_id,
          args.expected_fingerprint,
          args.expected_branch,
          args.base_commit,
          args.expected_paths,
          args.review_handoff_id,
        )
        const current = worktreeFingerprint(context.worktree, args.base_commit)
        const unstaged = nulPaths(runGit(context.worktree, ["diff", "--name-only", "-z", "--"]))
        const untracked = nulPaths(
          runGit(context.worktree, ["ls-files", "--others", "--exclude-standard", "-z"]),
        )
        const staged = nulPaths(
          runGit(context.worktree, ["diff", "--cached", "--name-only", "-z", args.base_commit, "--"]),
        )
        if (
          current.fingerprint !== args.expected_fingerprint ||
          current.branch !== args.expected_branch ||
          !samePaths(current.changed_paths, args.expected_paths) ||
          unstaged.length > 0 ||
          untracked.length > 0 ||
          !samePaths(staged, args.expected_paths)
        ) {
          throw new Error("Worktree or index no longer matches the staged reviewed diff")
        }
        runGit(context.worktree, [
          "-c",
          "user.name=Detection Factory",
          "-c",
          "user.email=detection-factory@localhost",
          "-c",
          "core.hooksPath=/dev/null",
          "commit",
          "-m",
          args.commit_message,
          "--",
        ])
        const committed = committedFingerprint(context.worktree, args.base_commit, args.expected_paths)
        const verified =
          committed.fingerprint === args.expected_fingerprint &&
          committed.paths_sha256 === pathsFingerprint(args.expected_paths) &&
          committed.branch === args.expected_branch
        if (!verified) throw new Error("Created commit does not match the reviewed publish binding")
        return JSON.stringify({ committed: true, verified: true, ...committed }, null, 2)
      }

      if (args.action === "verify_commit") {
        if (
          !args.base_commit ||
          !args.expected_fingerprint ||
          !args.expected_paths ||
          !args.expected_branch ||
          !args.review_handoff_id
        ) {
          return "Request rejected: verify_commit requires the complete reviewed publish binding."
        }
        assertPublishCheckpoint(
          args.run_id,
          args.expected_fingerprint,
          args.expected_branch,
          args.base_commit,
          args.expected_paths,
          args.review_handoff_id,
        )
        const committed = committedFingerprint(context.worktree, args.base_commit, args.expected_paths)
        const verified =
          committed.fingerprint === args.expected_fingerprint &&
          committed.paths_sha256 === pathsFingerprint(args.expected_paths) &&
          committed.branch === args.expected_branch
        return JSON.stringify({ verified, ...committed }, null, 2)
      }

      if (!args.kind) return "Request rejected: read and write require kind."
      const kind = args.kind as StateKind
      const path = statePath(args.run_id, kind)
      if (args.action === "read") {
        const stat = assertSafeFile(path)
        if (stat.size > MAX_CONTENT_BYTES) {
          return `Request rejected: ${path} exceeds the state size limit.`
        }
        return readFileSync(path, "utf8")
      }

      if (args.action !== "write" || args.content === undefined) {
        return "Request rejected: write requires content."
      }
      return JSON.stringify(writeAtomic(path, args.content, kind), null, 2)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown state error"
      return `Detection factory state operation failed: ${message}`
    }
  },
})
