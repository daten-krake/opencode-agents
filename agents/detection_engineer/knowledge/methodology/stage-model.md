# Stage Model: Indicator / Behavioral / Analytic

Classification of detection rules on the Indicator / Behavioral / Analytic spectrum.

## Stage 1: Indicator Detection

Static IOC match — hash, IP address, domain name, known file name, specific registry key value.

- **What it detects**: Known-bad artifacts. A file with a specific SHA256 hash. A connection to a known C2 IP. A registry value matching a known malware persistence key.
- **Strengths**: Low false positive rate (when the IOC is high-confidence). Easy to operationalize.
- **Weaknesses**: Breaks instantly when the attacker changes the artifact. Hash changes with recompile. Domain changes with infrastructure rotation.
- **Typical abstraction layer**: Tool (Layer 1)
- **Maturity**: `indicator`

## Stage 2: Behavioral Detection

Procedure-level pattern — a sequence of events tied to a known attacker workflow.

- **What it detects**: A specific arrangement of events that matches known attacker tradecraft. PowerShell downloading a payload over HTTP and then executing it. A service being created with a binary path in `%TEMP%`. LSASS being accessed by a non-system process.
- **Strengths**: Catches known threat actor procedures. Good signal-to-noise when well-tuned.
- **Weaknesses**: Operator can swap a procedure step and evade. Requires knowledge of specific adversary playbooks.
- **Typical abstraction layer**: Procedure or Technique (Layer 2–3)
- **Maturity**: `behavioral`

## Stage 3: Analytic Detection

Function/operation-level logic — detects the *effect* of a technique regardless of procedure.

- **What it detects**: The underlying operation an attacker must perform, no matter how they implement it. Any cross-process memory write with execute permission (injection). Any privilege escalation via directory role membership addition. Any anomalous authentication from a previously unseen IP to multiple resources.
- **Strengths**: Most resilient. Survives procedure swaps. Hard to evade without abandoning the technique entirely.
- **Weaknesses**: Higher development cost. May require complex correlations. Can produce false positives if baseline isn't well-understood.
- **Typical abstraction layer**: Function (Layer 3–4)
- **Maturity**: `analytic`

## Relationship to Abstraction Pyramid

| Stage | Typical Abstraction Layer | Evasion Resistance |
|---|---|---|
| Indicator | Tool (Layer 1) | None |
| Behavioral | Procedure / Technique (Layer 2–3) | Low-Medium |
| Analytic | Technique / Function (Layer 3–4) | High |

## Honesty Rule

A Stage 1 indicator rule is perfectly valid if that's what the telemetry supports. Do not dress up an IOC sweep as "analytic." Set `maturity` honestly. Do not emit the deprecated tag representation.
