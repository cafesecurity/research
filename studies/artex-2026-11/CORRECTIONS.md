# Corrections

Study `artex-2026-11`. Every correction made to this study's findings, with what changed and why. Corrections made before publication are listed too, because they show where a careful first reading went wrong.

## Before version 1.0 (22 November 2026)

The review went through three passes. Each pass re-checked every earlier finding against the code.

| # | Was | Now | Claims |
| --- | --- | --- | --- |
| 1 | Nothing in the code enforces scope. | An asset gate exists in code (blocklist and optional allowlist), but it checks only ARTEX's records and the work it hands out, never the commands agents run. | C082, C083 |
| 2 | The guard helps the agent get past a target's defences; it treats a WAF block as a signal to change tactics. | Wrong. The code in question makes ARTEX's *own* blocks stick. The "change tactics" tally only reaches the audit screen. What stands: a code comment and the workers' instructions describe retrying after a block. | C089, C090, C091 |
| 3 | ARTEX switches to backup model accounts when a key is revoked. | Only if the operator switches failover on; it's off by default. | C051 |
| 4 | Runs are unlimited. | Turns are unlimited, but worker and chat-agent runs have a 20-minute budget by default. The pentest agent and whole tasks have no time limit. | C070, C071, C072 |
| 5 | Capability is the model plus shell, browser and three skills. | By default only one skill is visible and the browser plugin is disabled; shells are on. | C040, C036 |
| 6 | The recording proxy carries all tool traffic. | It records web traffic only; raw scans bypass it. | C060, C061 |
| 7 | The guard applies to workers. | It's attached to every agent, but its rules cover only eight named tools. | C086, C087 |
| 8 | The surviving upstream copy is a mirror; the backdoor ran on any login. | FailSafe calls it the best available source base, not a mirror. The backdoor fired only when a login field began with a secret marker. | C003, C004 |
| 9 | Several line references were off by a few lines. | Fixed; all code references are now checked by script. | all |
| 10 | The engine is "general-purpose" (an inference from its package names). | Confirmed by the engine's own README. | C012 |
| 11 | FailSafe's build is identical to upstream apart from minor changes. | Ten production Go files differ; none affects the findings. Upstream v0.3.15 became the citation base. | C002 |
| 12 | Every recorded asset is automatically looked up and probed. | The engine for that is started and passed to every worker, but nothing ever calls it. It's dormant. | C063 |
| 13 | The goals agent has a shell and a 20-minute budget. | It has no shell, and the budget isn't applied to it. | C037, C071 |
| 14 | The asset gate fails open. | Only when recording assets; when handing out work, a read error blocks the work. | C083 |
| 15 | The engine's only mention of untrusted content is in an example app. | It also uses "untrusted" once, about tools validating the model's own input. That isn't a prompt-injection defence, so the finding stands; the check was narrowed. | C020 |
| 16 | Several findings were missing. | Added: built-in domain blocklist, first-visitor admin set-up, no login throttling, seven-day sessions, health and status fingerprints, conversation recording, outbound proxy, web search default, rule coverage per tool, AI judge off, release cadence, v0.3.30 spot check, hard-coded hosts, self-extending auto agent, image contents, and the engine review. | various |

## After version 1.0

| # | Was | Now | Claims |
| --- | --- | --- | --- |
| 1 | No instruction to treat target content as data was found in ARTEX's prompts. | Narrowed to the prompts of ARTEX's *agents*. Reviewing the prompts for version 1.2 found that the optional AI judge's prompt does tell its model to treat input as untrusted; the judge reviews the agents' tool calls and is off by default, so the finding about the agents stands. | C093, C182 |
| 2 | Public reporting that agentic tools are loud is consistent with the code: "no stealth features found". | True of v0.3.15 only. v0.3.30 (14 November) sends ordinary browser user agents and tells its agents to copy the target's own headers, so tool names in web traffic now only identify older builds. | C209, C210, C130 |

To propose a correction, [open an issue](../../.github/ISSUE_TEMPLATE/report-a-mistake.yml).
