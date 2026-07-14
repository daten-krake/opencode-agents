# Capability Abstraction

Source: Jared Atkinson / SpecterOps methodology.

## The Abstraction Pyramid

Detection strength increases as you move down the pyramid. Each layer represents a different level of abstraction of the attacker's behavior:

### Layer 1: Tool Artifacts (brittle — breaks with every recompile)
Detect specific binary, hash, string, user agent, port, or IP.

- **Examples**: SHA256 hash of a known C2 implant, specific mutex name, hardcoded C2 domain
- **When to use**: Only when no richer telemetry is available. IOC sweeps, threat intelligence matching.
- **Evasion resistance**: None. Changes with every recompile or operator config tweak.

### Layer 2: Procedure (brittle — breaks when operator swaps technique variant)
Detect the specific API/command sequence a named tool or actor uses.

- **Example**: Detecting `CreateRemoteThread` + `VirtualAllocEx` + `WriteProcessMemory` as a specific injection sequence
- **Example**: Detecting `certutil.exe -urlcache -split -f http://...` as a specific download pattern
- **When to use**: When you know the specific tooling in use and want to catch that exact variant.
- **Evasion resistance**: Low. Operator switches from `CreateRemoteThread` to `NtCreateThreadEx` and the rule misses.

### Layer 3: Technique / Sub-Technique Behavior (resilient — survives procedure swaps)
Detect the observable effect regardless of the specific procedure used.

- **Example**: "Process A allocates executable memory in Process B and starts execution there" — catches classic injection, process hollowing, APC injection, etc.
- **Example**: "A non-admin account is granted privileged directory role membership outside of normal change windows"
- **When to use**: This is the sweet spot for most detection engineering. Balances resilience with signal clarity.
- **Evasion resistance**: Medium. Attacker must switch to a completely different technique.

### Layer 4: Function / Operation (most resilient — hardest to evade without abandoning the technique)
Detect the underlying OS/cloud primitive that every procedure must eventually touch.

- **Example**: Any call to `NtWriteVirtualMemory` crossing process boundaries with `PROCESS_VM_OPERATION` + `PROCESS_VM_WRITE`
- **Example**: `RoleManagement.ReadWrite.Directory` permission grant on any service principal or application
- **Example**: `AddMember` operation on any privileged Azure AD group
- **When to use**: When the telemetry supports it. Produces the most resilient detections.
- **Evasion resistance**: High. Attacker must find an entirely different way to achieve their goal.

## Rules for Applying Abstraction

1. **Detect as low on the pyramid as telemetry allows.** If Defender gives you `DeviceImageLoadEvents` with full stack and `DeviceProcessEvents` with command line, you do not write an IOC rule for a hash.

2. **If you must write high on the pyramid, say so explicitly.** If you write a vendor-specific IOC sweep because richer telemetry is unavailable, state that in the rule's `considerations`.

3. **For every rule, identify the layer you targeted and why.** Document the reasoning in `technical_description`. One or two sentences, not an essay.

## Abstraction Tags in Rules

Map each detection rule's `abstraction` tag:
- `abstraction:tool` — Layer 1
- `abstraction:procedure` — Layer 2
- `abstraction:technique` — Layer 3
- `abstraction:function` — Layer 4

## Example Breakdown

**Detection**: "Admin promotion after Role Management Application Permission Grant"

- **What the attacker does**: Grants `RoleManagement.ReadWrite.Directory` app permission to an existing application, then promotes a user to Global Administrator using that application's elevated privileges.
- **Layer 4 (function)**: The actual permission grant API call (`oAuth2PermissionGrant`) + the `AddMember` directory role operation.
- **Why Layer 4**: Every Azure AD privilege escalation via application permissions must touch `RoleManagement.ReadWrite.Directory` or equivalent grant operations. No procedure variant can bypass this requirement — the grant is the function-level primitive.
