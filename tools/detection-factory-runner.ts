import { tool } from "@opencode-ai/plugin"
import { spawnSync } from "node:child_process"
import { createHash } from "node:crypto"
import { closeSync, constants, fstatSync, lstatSync, openSync, readFileSync, realpathSync } from "node:fs"
import { homedir } from "node:os"
import { basename, isAbsolute, join, relative, resolve } from "node:path"

const STANDARD_WORKERS = new Set([
  "detection-implementer",
  "detection-implementer-local",
  "detection-reviewer",
  "detection-reviewer-local",
  "detection-reviewer-auto",
  "detection-reviewer-local-auto",
])
const METADATA_REVIEWERS = new Set(["detection-metadata-reviewer", "detection-metadata-reviewer-local"])
const EXECUTABLES = new Set(["python3"])
const GRAPH_ENV_KEYS = ["MS_GRAPH_TENANT_ID", "MS_GRAPH_CLIENT_ID", "MS_GRAPH_CLIENT_SECRET"] as const
const DEFENDER_SECRETS_FILE = join(homedir(), ".local/share/opencode/secrets/defender-xdr.env")
const SAFE_PATH = "/usr/local/bin:/usr/bin:/bin"
const SAFE_GIT_ENV = {
  PATH: SAFE_PATH,
  HOME: "/nonexistent",
  XDG_CONFIG_HOME: "/nonexistent",
  GIT_CONFIG_GLOBAL: "/dev/null",
  GIT_CONFIG_NOSYSTEM: "1",
  GIT_TERMINAL_PROMPT: "0",
  GIT_OPTIONAL_LOCKS: "0",
  LANG: "C.UTF-8",
  LC_ALL: "C.UTF-8",
}
const COMMIT_ID = /^[0-9a-f]{40,64}$/
const MAX_SOURCE_BYTES = 1024 * 1024
const MAX_OUTPUT_BYTES = 1024 * 1024
const MAX_DIFF_BYTES = 512 * 1024
const MAX_METADATA_FILE_BYTES = 2 * 1024 * 1024
const MAX_METADATA_POLICY_BYTES = 4096
const MAX_ARGS = 32
const MAX_ARG_BYTES = 2048
const MAX_TIMEOUT_SECONDS = 600
const METADATA_PATH = /^[A-Za-z0-9._/-]+\.ya?ml$/
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
const METADATA_POLICY_PATH = ".detection-factory.json"

type MetadataField = "id" | "owner"

type TopLevelField = {
  line_start: number
  line_end: number
  value_start: number
  value_end: number
  raw_value: string
}

function inside(root: string, path: string): boolean {
  const fromRoot = relative(resolve(root), resolve(path))
  return fromRoot === "" || (fromRoot !== ".." && !fromRoot.startsWith("../") && !isAbsolute(fromRoot))
}

function worktreePath(worktree: string, path: string, allowRoot = false): string {
  if (path.includes("\0")) throw new Error("Path contains a NUL byte")
  const absolute = resolve(worktree, path || ".")
  if (!inside(worktree, absolute) || (!allowRoot && absolute === resolve(worktree))) {
    throw new Error(`Path escapes the worktree: ${path}`)
  }
  return absolute
}

export function loadGraphEnvironment(path = DEFENDER_SECRETS_FILE): Record<string, string> {
  const stat = lstatSync(path)
  if (stat.isSymbolicLink() || !stat.isFile()) throw new Error("Defender credential source is not a regular file")
  if (typeof process.getuid === "function" && stat.uid !== process.getuid()) {
    throw new Error("Defender credential source is not owned by the current user")
  }
  if ((stat.mode & 0o077) !== 0) {
    throw new Error("Defender credential source permissions must deny group and other access")
  }

  const values: Record<string, string> = {}
  for (const rawLine of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith("#") || !line.includes("=")) continue
    const separator = line.indexOf("=")
    const key = line.slice(0, separator).trim().replace(/^export\s+/, "")
    const rawValue = line.slice(separator + 1).trim()
    const value =
      (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
      (rawValue.startsWith("'") && rawValue.endsWith("'"))
        ? rawValue.slice(1, -1)
        : rawValue
    values[key] = value
  }

  const environment: Record<string, string> = {}
  for (const key of GRAPH_ENV_KEYS) {
    const value = values[key]
    if (!value || value.includes("\0") || value.includes("\n") || value.includes("\r")) {
      throw new Error(`Defender credential source is missing a valid ${key}`)
    }
    environment[key] = value
  }
  return environment
}

export function redactSecrets(value: string, secrets: string[]): string {
  let redacted = value
  for (const secret of secrets.filter(Boolean).sort((left, right) => right.length - left.length)) {
    redacted = redacted.replaceAll(secret, "[REDACTED]")
  }
  return redacted
}

function run(
  worktree: string,
  executable: string,
  args: string[],
  timeout = 30_000,
  extraEnvironment: Record<string, string> = {},
) {
  const result = spawnSync(executable, args, {
    cwd: worktree,
    encoding: "utf8",
    maxBuffer: MAX_OUTPUT_BYTES,
    timeout,
    shell: false,
    env: {
      PATH: SAFE_PATH,
      HOME: "/nonexistent",
      XDG_CONFIG_HOME: "/nonexistent",
      XDG_CACHE_HOME: "/nonexistent",
      TMPDIR: "/tmp",
      LANG: "C.UTF-8",
      LC_ALL: "C.UTF-8",
      CI: "1",
      PYTHONDONTWRITEBYTECODE: "1",
      PYTHONNOUSERSITE: "1",
      ...extraEnvironment,
    },
  })
  if (result.error) throw result.error
  const secrets = Object.values(extraEnvironment)
  return {
    exit_code: result.status,
    signal: result.signal,
    stdout: redactSecrets(result.stdout, secrets),
    stderr: redactSecrets(result.stderr, secrets),
  }
}

function git(worktree: string, args: string[], maxBytes = MAX_OUTPUT_BYTES) {
  const result = spawnSync("git", args, {
    cwd: worktree,
    encoding: "utf8",
    maxBuffer: maxBytes,
    timeout: 30_000,
    shell: false,
    env: SAFE_GIT_ENV,
  })
  if (result.error) throw result.error
  if (result.status !== 0) {
    throw new Error(result.stderr.replace(/[\r\n\t]+/g, " ").slice(0, 300) || "Git inspection failed")
  }
  return result.stdout
}

function gitBuffer(worktree: string, args: string[], maxBytes = MAX_OUTPUT_BYTES): Buffer {
  const result = spawnSync("git", args, {
    cwd: worktree,
    encoding: "buffer",
    maxBuffer: maxBytes,
    timeout: 30_000,
    shell: false,
    env: SAFE_GIT_ENV,
  })
  if (result.error) throw result.error
  if (result.status !== 0) {
    throw new Error(result.stderr.toString("utf8").replace(/[\r\n\t]+/g, " ").slice(0, 300) || "Git inspection failed")
  }
  return result.stdout
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

function readRegularFileNoFollow(path: string, maxBytes: number, label: string): { content: Buffer; mode: number } {
  let descriptor: number | null = null
  try {
    descriptor = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW)
    const stat = fstatSync(descriptor)
    if (!stat.isFile() || stat.size > maxBytes) throw new Error(`${label} must be a small regular file`)
    return { content: readFileSync(descriptor), mode: stat.mode }
  } finally {
    if (descriptor !== null) closeSync(descriptor)
  }
}

function safeMetadataPath(worktree: string, path: string): string {
  if (
    !METADATA_PATH.test(path) ||
    path.startsWith("/") ||
    path.includes("//") ||
    path.split("/").some((part) => part === "." || part === "..")
  ) {
    throw new Error("Metadata inspection requires one safe relative YAML path")
  }
  return worktreePath(worktree, path)
}

// Keep review parsing independent from the mutating state tool to avoid a shared proof bug.
function topLevelFields(content: string, key: string): TopLevelField[] {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const expression = new RegExp(`^${escaped}:([^\\r\\n]*)(?:\\r?\\n|$)`, "gm")
  return [...content.matchAll(expression)].map((match) => {
    const lineStart = match.index ?? 0
    const rawValue = match[1]
    const valueStart = lineStart + key.length + 1
    return {
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
    const value = JSON.parse(doubleQuoted[1])
    if (typeof value !== "string") throw new Error("Metadata scalar is not a string")
    return { empty: value.length === 0, value }
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

function baseBlob(worktree: string, baseCommit: string, path: string, maxBytes: number): Buffer {
  const record = gitBuffer(worktree, ["ls-tree", "-z", baseCommit, "--", path])
  if (record.length === 0) throw new Error(`Tracked base file does not exist: ${path}`)
  const value = record.toString("utf8").replace(/\0$/, "")
  const tab = value.indexOf("\t")
  if (tab === -1 || value.slice(tab + 1) !== path) throw new Error(`Unexpected base tree entry: ${path}`)
  const [mode, type] = value.slice(0, tab).split(" ")
  if (type !== "blob" || !["100644", "100755"].includes(mode)) {
    throw new Error(`Metadata source is not a regular tracked file: ${path}`)
  }
  const content = gitBuffer(worktree, ["show", `${baseCommit}:${path}`], maxBytes + 1)
  if (content.length > maxBytes) throw new Error(`Metadata source exceeds ${maxBytes} bytes: ${path}`)
  return content
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

function normalizedFields(fields: MetadataField[] | undefined): MetadataField[] {
  if (!fields || fields.length === 0) throw new Error("requested_fields must contain id and/or owner")
  const normalized = [...new Set(fields)].sort() as MetadataField[]
  if (normalized.length !== fields.length || normalized.some((field) => field !== "id" && field !== "owner")) {
    throw new Error("requested_fields must contain unique id and/or owner entries")
  }
  return normalized
}

function canonicalOwnerPolicy(worktree: string, baseCommit: string) {
  const content = baseBlob(worktree, baseCommit, METADATA_POLICY_PATH, MAX_METADATA_POLICY_BYTES)
  const text = decodeUtf8(content, METADATA_POLICY_PATH)
  const strictPolicy = /^\s*\{\s*"metadata"\s*:\s*\{\s*"canonicalOwner"\s*:\s*("(?:[^"\\]|\\.)*")\s*\}\s*\}\s*$/s
  const match = text.match(strictPolicy)
  if (!match) throw new Error(`${METADATA_POLICY_PATH} has unsupported or ambiguous content`)
  const owner = JSON.parse(match[1])
  if (
    typeof owner !== "string" ||
    !owner ||
    owner.trim() !== owner ||
    owner.length > 256 ||
    /[\u0000-\u001f\u007f]/.test(owner)
  ) {
    throw new Error(`${METADATA_POLICY_PATH} canonicalOwner is invalid`)
  }
  return { owner, sha256: sha256(content) }
}

function hashGitObject(worktree: string, path: string, content: Buffer): string {
  const result = spawnSync("git", ["hash-object", `--path=${path}`, "--stdin"], {
    cwd: worktree,
    input: content,
    encoding: "utf8",
    maxBuffer: MAX_OUTPUT_BYTES,
    timeout: 30_000,
    shell: false,
    env: SAFE_GIT_ENV,
  })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error("Could not hash metadata result as a Git object")
  return result.stdout.trim()
}

function metadataDiffFingerprint(
  worktree: string,
  baseCommit: string,
  path: string,
  content: Buffer,
  executable: boolean,
): string {
  const object = hashGitObject(worktree, path, content)
  const hash = createHash("sha256")
  hash.update("detection-factory-diff-v2\0")
  hash.update(baseCommit)
  hash.update("\0path\0")
  hash.update(path)
  hash.update("\0object\0")
  hash.update(`${executable ? "100755" : "100644"}:${object}`)
  return hash.digest("hex")
}

function inspectMetadataDiff(
  worktree: string,
  baseCommit: string,
  targetPath: string,
  requestedFields: MetadataField[] | undefined,
  expectedId: string | undefined,
  expectedOwner: string | undefined,
  expectedPolicySha256: string | undefined,
  expectedFingerprint: string | undefined,
) {
  if (!COMMIT_ID.test(baseCommit)) throw new Error("base_commit must be a full hexadecimal commit ID")
  git(worktree, ["cat-file", "-e", `${baseCommit}^{commit}`])
  const head = git(worktree, ["rev-parse", "HEAD"]).trim()
  if (head !== baseCommit) throw new Error("Metadata review requires HEAD to equal the reviewed base commit")
  const fields = normalizedFields(requestedFields)
  const absolute = safeMetadataPath(worktree, targetPath)
  const resultFile = readRegularFileNoFollow(absolute, MAX_METADATA_FILE_BYTES, "Metadata target")
  const paths = changedPaths(gitBuffer(worktree, ["status", "--porcelain=v1", "-z", "--untracked-files=all"]))
  if (paths.length !== 1 || paths[0] !== targetPath) {
    throw new Error(`Metadata review requires exactly one changed path: ${targetPath}`)
  }

  const baseBuffer = baseBlob(worktree, baseCommit, targetPath, MAX_METADATA_FILE_BYTES)
  const resultBuffer = resultFile.content
  const base = decodeUtf8(baseBuffer, `${targetPath} at base`)
  const result = decodeUtf8(resultBuffer, `${targetPath} in worktree`)
  for (const key of ["id", "owner", "query", "testblock"]) {
    uniqueTopLevelField(base, key)
    uniqueTopLevelField(result, key)
  }
  if ((base.match(/^---\s*$/gm) ?? []).length > 1 || (result.match(/^---\s*$/gm) ?? []).length > 1) {
    throw new Error("Multi-document YAML is not eligible for metadata review")
  }

  const values: Partial<Record<MetadataField, string>> = {}
  for (const field of fields) {
    const before = parseScalar(uniqueTopLevelField(base, field).raw_value)
    const after = parseScalar(uniqueTopLevelField(result, field).raw_value)
    if (!before.empty) throw new Error(`Base ${field} field was not empty`)
    if (after.empty) throw new Error(`Result ${field} field remains empty`)
    values[field] = after.value
  }
  if (fields.includes("id")) {
    if (!expectedId || values.id !== expectedId || !UUID_V4.test(expectedId)) {
      throw new Error("Result id does not equal the expected RFC 4122 UUID v4")
    }
  } else if (expectedId !== undefined) {
    throw new Error("Unexpected expected_id for an unrequested field")
  }
  if (fields.includes("owner")) {
    if (!expectedOwner || values.owner !== expectedOwner) throw new Error("Result owner does not equal expected_owner")
    if (expectedPolicySha256) {
      const policy = canonicalOwnerPolicy(worktree, baseCommit)
      if (policy.sha256 !== expectedPolicySha256 || policy.owner !== expectedOwner) {
        throw new Error("Result owner is not bound to the expected repository policy")
      }
    }
  } else if (expectedOwner !== undefined || expectedPolicySha256 !== undefined) {
    throw new Error("Unexpected owner evidence for an unrequested field")
  }

  const proof = {
    base_blob_sha256: sha256(baseBuffer),
    result_blob_sha256: sha256(resultBuffer),
    base_non_metadata_sha256: sha256(normalizedMetadata(base, fields)),
    result_non_metadata_sha256: sha256(normalizedMetadata(result, fields)),
    base_query_sha256: sha256(topLevelBlock(base, "query")),
    result_query_sha256: sha256(topLevelBlock(result, "query")),
    base_testblock_sha256: sha256(topLevelBlock(base, "testblock")),
    result_testblock_sha256: sha256(topLevelBlock(result, "testblock")),
  }
  const diffFingerprint = metadataDiffFingerprint(
    worktree,
    baseCommit,
    targetPath,
    resultBuffer,
    Boolean(resultFile.mode & 0o111),
  )
  const diffCheck = spawnSync("git", ["-c", "core.whitespace=cr-at-eol", "diff", "--check", baseCommit, "--", targetPath], {
    cwd: worktree,
    encoding: "utf8",
    maxBuffer: MAX_OUTPUT_BYTES,
    timeout: 30_000,
    shell: false,
    env: SAFE_GIT_ENV,
  })
  const valid =
    proof.base_non_metadata_sha256 === proof.result_non_metadata_sha256 &&
    proof.base_query_sha256 === proof.result_query_sha256 &&
    proof.base_testblock_sha256 === proof.result_testblock_sha256 &&
    diffCheck.status === 0 &&
    (!expectedFingerprint || diffFingerprint === expectedFingerprint)
  return {
    valid,
    target_path: targetPath,
    requested_fields: fields,
    values,
    changed_paths: paths,
    diff_fingerprint: diffFingerprint,
    fingerprint_matches: expectedFingerprint ? diffFingerprint === expectedFingerprint : null,
    proof,
    diff_check_exit_code: diffCheck.status,
    diff_check_output: `${diffCheck.stdout}${diffCheck.stderr}`,
  }
}

function validateArgs(argv: string[]) {
  if (argv.length === 0 || argv.length > MAX_ARGS) throw new Error(`argv must contain 1-${MAX_ARGS} entries`)
  for (const value of argv) {
    if (!value || value.includes("\0") || value.includes("\n") || Buffer.byteLength(value) > MAX_ARG_BYTES) {
      throw new Error("argv contains an invalid entry")
    }
  }

  const executable = basename(argv[0])
  if (argv[0] !== executable) throw new Error("Executable paths are not allowed")
  if (!EXECUTABLES.has(executable)) throw new Error(`Executable is not allowlisted: ${executable}`)
  if (argv[1]?.startsWith("-")) {
    const allowedPytestModule = argv[1] === "-m" && argv[2] === "pytest"
    if (!allowedPytestModule) throw new Error("Inline Python and arbitrary modules are not allowed")
  }
}

function assertUnmodifiedTrackedFile(worktree: string, path: string) {
  const absolute = worktreePath(worktree, path)
  const trackedPath = relative(resolve(worktree), absolute)
  const stat = lstatSync(absolute)
  if (stat.isSymbolicLink() || !stat.isFile()) throw new Error(`Command input is not a regular file: ${path}`)
  git(worktree, ["ls-files", "--error-unmatch", "--", trackedPath])
  const changed = spawnSync("git", ["diff", "--quiet", "--no-ext-diff", "--no-textconv", "HEAD", "--", trackedPath], {
    cwd: worktree,
    shell: false,
    env: SAFE_GIT_ENV,
  })
  if (changed.status !== 0) throw new Error(`Command input differs from the repository baseline: ${path}`)
}

function commandInputFiles(worktree: string, cwd: string, argv: string[]): string[] {
  const candidates: string[] = []
  if (argv[1] && !argv[1].startsWith("-")) {
    candidates.push(relative(worktree, resolve(cwd, argv[1])))
  }
  return candidates
}

function validateRepositorySource(worktree: string, source: string, argv: string[], cwd: string) {
  const sourcePath = worktreePath(worktree, source)
  const sourceRelative = relative(resolve(worktree), sourcePath)
  const stat = lstatSync(sourcePath)
  if (stat.isSymbolicLink() || !stat.isFile() || stat.size > MAX_SOURCE_BYTES) {
    throw new Error("Validation source must be a small regular file")
  }
  assertUnmodifiedTrackedFile(worktree, sourceRelative)
  for (const path of commandInputFiles(worktree, cwd, argv)) assertUnmodifiedTrackedFile(worktree, path)

  const sourceText = readFileSync(sourcePath, "utf8")
  const commandPath = argv[1] && !argv[1].startsWith("-") ? resolve(cwd, argv[1]) : null
  if (commandPath === sourcePath) {
    throw new Error("Repository validation requires an independent instruction or CI source")
  }
  if (!sourceText.includes(argv.join(" "))) {
    throw new Error("Validation command is not exactly evidenced by its repository source")
  }
}

function validateFactorySource(source: string, argv: string[]) {
  if (!isAbsolute(source)) throw new Error("Factory validation source must be an absolute path")
  const sourcePath = realpathSync(source)
  const allowedRoot = realpathSync(
    resolve(process.env.HOME ?? "", ".config/opencode/skills/detection-test"),
  )
  if (!inside(allowedRoot, sourcePath)) throw new Error("Factory validation source is not allowlisted")
  const script = argv.find((value) => value.endsWith("test-detection-rules.py"))
  if (!script || !isAbsolute(script) || realpathSync(script) !== sourcePath) {
    throw new Error("Factory validation command does not execute the cited source")
  }
}

export default tool({
  description:
    "Inspect detection or metadata diffs and execute provenance-backed validators without granting factory workers an interactive shell or direct credential access.",
  args: {
    action: tool.schema.enum(["inspect_diff", "inspect_metadata_diff", "run_validation"]),
    base_commit: tool.schema.string().optional(),
    target_path: tool.schema.string().optional(),
    requested_fields: tool.schema.array(tool.schema.enum(["id", "owner"])).optional(),
    expected_id: tool.schema.string().optional(),
    expected_owner: tool.schema.string().optional(),
    expected_policy_sha256: tool.schema.string().optional(),
    expected_fingerprint: tool.schema.string().optional(),
    argv: tool.schema.array(tool.schema.string()).optional(),
    cwd: tool.schema.string().optional(),
    source: tool.schema.string().optional(),
    source_kind: tool.schema.enum(["repository", "factory"]).optional(),
    timeout_seconds: tool.schema.number().int().min(1).max(MAX_TIMEOUT_SECONDS).optional(),
  },
  async execute(args, context) {
    try {
      if (args.action === "inspect_metadata_diff") {
        if (!METADATA_REVIEWERS.has(context.agent)) {
          return "Request rejected: only profile-pinned metadata reviewers may inspect metadata diffs."
        }
        if (!args.base_commit || !args.target_path || !args.requested_fields) {
          return "Request rejected: inspect_metadata_diff requires base_commit, target_path, and requested_fields."
        }
        return JSON.stringify(
          inspectMetadataDiff(
            context.worktree,
            args.base_commit,
            args.target_path,
            args.requested_fields as MetadataField[],
            args.expected_id,
            args.expected_owner,
            args.expected_policy_sha256,
            args.expected_fingerprint,
          ),
          null,
          2,
        )
      }

      if (!STANDARD_WORKERS.has(context.agent)) {
        return "Request rejected: only detection-factory implementers and reviewers may use this action."
      }

      if (args.action === "inspect_diff") {
        if (!args.base_commit || !COMMIT_ID.test(args.base_commit)) {
          return "Request rejected: inspect_diff requires a full base_commit."
        }
        git(context.worktree, ["cat-file", "-e", `${args.base_commit}^{commit}`])
        const diff = git(
          context.worktree,
          ["diff", "--binary", "--no-ext-diff", args.base_commit, "--"],
          MAX_DIFF_BYTES,
        )
        const status = git(context.worktree, ["status", "--short"])
        const diffCheck = spawnSync("git", ["diff", "--check", args.base_commit, "--"], {
          cwd: context.worktree,
          encoding: "utf8",
          maxBuffer: MAX_OUTPUT_BYTES,
          timeout: 30_000,
          shell: false,
          env: SAFE_GIT_ENV,
        })
        return JSON.stringify(
          {
            status,
            diff,
            diff_check_exit_code: diffCheck.status,
            diff_check_output: `${diffCheck.stdout}${diffCheck.stderr}`,
          },
          null,
          2,
        )
      }

      if (!args.argv || !args.source || !args.source_kind) {
        return "Request rejected: run_validation requires argv, source, and source_kind."
      }
      validateArgs(args.argv)
      const cwd = worktreePath(context.worktree, args.cwd ?? ".", true)
      let validationEnvironment: Record<string, string> = {}
      if (args.source_kind === "repository") {
        validateRepositorySource(context.worktree, args.source, args.argv, cwd)
      } else {
        validateFactorySource(args.source, args.argv)
        if (args.argv.includes("--execute")) {
          validationEnvironment = loadGraphEnvironment()
        }
      }

      const result = run(
        cwd,
        args.argv[0],
        args.argv.slice(1),
        (args.timeout_seconds ?? MAX_TIMEOUT_SECONDS) * 1000,
        validationEnvironment,
      )
      return JSON.stringify(
        {
          argv: args.argv,
          cwd: relative(context.worktree, cwd) || ".",
          source: args.source,
          ...result,
        },
        null,
        2,
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown runner error"
      return `Detection factory runner failed: ${message}`
    }
  },
})
