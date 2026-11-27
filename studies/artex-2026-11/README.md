# ARTEX: what the code says

<!--if-brand-->**Café Security Research**<!--/if-brand--><!--if-named:**{name}** · Café Security Research--> · Study `artex-2026-11` · Version 1.6, 27 November 2026

A static review of the source code of ARTEX, the open-source AI hacking tool the FBI warned about on 13 November 2026, and of the agent engine it runs on. Nothing was built or run.

This folder holds the raw material: the claims and their evidence, the method, and the corrections. Reports for different readers are built from it.

## Key findings

- **The capability is the AI model, not the code.** ARTEX has no exploit library. A planner and three workers (by default) attack with a shell, a browser and standard tools, and the model decides what to type. ([C042](claims.yaml), C031, C035)
- **Its safety catch is off.** ARTEX bypasses its engine's approval step for every agent. What's left is a small fixed floor in the engine and ARTEX's own deletable rules (C033, C013, C015, C084).
- **Built not to break things, not to stop data leaving.** Rules against destructive commands are on; the rule against piping data out ships switched off (C085).
- **Scope limits are soft.** They're checked against ARTEX's own records, never against the commands its agents run (C081, C082, C083).
- **It's exposing its operators too.** By default, every command its agents run can read the operator's AI model keys and database password, and nothing tells the agents to distrust what targets send back (C106, C093). Whether a target could exploit that is untested (C094).
- **Its instructions are a setting, and they assume permission.** Every agent's prompt can be rewritten from the console, the rule to stay in scope is in the editable part, and the prompts call every engagement authorised without anything checking it. A report writer saves exploit code with each finding (C170, C171, C184, C180).
- **Easy to fingerprint.** An unauthenticated health check names the service and its version, on port 8787 by default (C104, C100).

## Not the only one

ARTEX is one of many. Google's threat intelligence team has reported attackers using CAIRN, CyberStrikeAI and PentAGI alongside it (C160), criminals discussed HexStrike AI within hours of its release (C161), and one census counted about 70 open-source offensive agents by March 2026 (C166). Legitimate research and commercial tools do similar work under authorisation (C163, C165, C167). None of them was reviewed here. This study looks at ARTEX because the FBI warned about it and its code is public, and its defensive lessons apply to the whole class (C168).

## What's here

| File | What it is |
| --- | --- |
| [`claims.yaml`](claims.yaml) | Every finding as a numbered claim (C001-C207) with its evidence and status. The source of truth. |
| [`METHODOLOGY.md`](METHODOLOGY.md) | What was reviewed, how, and how to check the claims yourself. |
| [`CORRECTIONS.md`](CORRECTIONS.md) | Every correction made during the review, kept in public. |
| [`reports/teardown.md`](reports/teardown.md) | The teardown report for CISOs, business leaders and defenders. |
| [`reports/prompt-design.md`](reports/prompt-design.md) | How ARTEX's prompts are designed, described rather than reproduced. |
| [`reports/attack-mapping.md`](reports/attack-mapping.md) | The study's behaviours mapped to MITRE ATT&CK, a detection and a fix for each, with a [Navigator layer](indicators/attack/navigator-layer.json). |
| [`faq.yaml`](faq.yaml) | Plain answers to common questions, each tied to its claims. |

## Check it yourself

Get your own copies of the sources at the pinned commits ([methodology](METHODOLOGY.md#reproducing-the-checks)), then run:

```sh
pip install -r ../../scripts/requirements.txt
python3 ../../scripts/check_claims.py claims.yaml \
  --source artex-v0.3.15=PATH --source artex-v0.3.30=PATH \
  --source failsafe=PATH --source norma-v0.4.3=PATH
```

At version 1.5, all 86 automatically checked claims pass; 60 more are checked by hand against public sources or by reading.

## Disagree, or found something?

Open an issue with the claim ID: [challenge a claim](../../.github/ISSUE_TEMPLATE/challenge-a-claim.yml), [add evidence](../../.github/ISSUE_TEMPLATE/add-evidence.yml) or [report a mistake](../../.github/ISSUE_TEMPLATE/report-a-mistake.yml). Anything that would help an attacker goes through the [private route](../../SECURITY.md) instead.

## Changes

- **1.6, 27 November 2026.** Added a [MITRE ATT&CK mapping](reports/attack-mapping.md): the study's behaviours lined up against the framework, each with the claims behind it, a detection (pointing at the shipped Sigma, YARA and query files where one exists) and a mitigation, plus an [ATT&CK Navigator layer](indicators/attack/navigator-layer.json). No new claims; the mapping cites existing ones, and the detection-first framing follows the indicators' order (behaviour over fingerprints).
- **1.5, 26 November 2026.** Added [indicators and detections](indicators/README.md): Sigma rules for four behavioural alerts with Splunk, Microsoft Sentinel and Google Cloud versions, names seen in incidents and console fingerprints with their sources, and YARA rules for finding ARTEX on your own systems, with steps for using each; all marked as starting points. Added the readiness planner on the site. New claims C218 (names chosen at run time) and C219 (Bitrise's account).
- **1.4, 26 November 2026.** v0.3.30 (14 November) sends ordinary browser user agents and tells its agents to copy the target's headers, the first stealth feature found, so tool names such as "norma/0.4" now only identify older builds (C208-C210). Checked Bitrise's, WorkOS's and a detection engineer's accounts against the code (C211-C213). Added v0.3.30's escaped-command fix and its optional agent control endpoint (C214, C215), and the size and language of the code (C216, C217). Corrected one row of the public-reporting table (see [corrections](CORRECTIONS.md)).
- **1.3, 23 November 2026.** Added audience guides (overview, CISOs and leaders, security teams, red teams and vendors, policy and government), a house style guide, and sourced context claims on the AI-pentest market, the 2026 agent-escape incidents, autonomous ransomware, the patching squeeze and detection (C190-C207).
- **1.2, 23 November 2026.** Added the prompt design report and its claims (C170-C186). Corrected C093: the optional AI judge's prompt does treat its input as untrusted (see [corrections](CORRECTIONS.md)).
- **1.1, 23 November 2026.** Added the FAQ, the law claims for the UK, EU, US, Canada and the Budapest Convention (C150-C155), and context on other AI offensive tools (C160-C168). No existing finding changed.
- **1.0, 22 November 2026.** First release.

## Cite

<!--if-brand-->Café Security Research<!--/if-brand--><!--if-named:{cite}--> (2026). *ARTEX: what the code says* (study artex-2026-11, v1.6).<!--if-named: Café Security Research.--> https://github.com/cafesecurity/research
