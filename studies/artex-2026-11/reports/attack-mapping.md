# ARTEX mapped to MITRE ATT&CK

<!--if-brand-->**Café Security Research**<!--/if-brand--><!--if-named:**{name}** · Café Security Research--> · Study `artex-2026-11` · Companion to the [teardown](teardown.md) and the [indicators](../indicators/README.md)

This maps the behaviours in the study to [MITRE ATT&CK](https://attack.mitre.org/) techniques, so a defender can line ARTEX up against the framework their controls and detections are already written around. Every row cites the claims behind it, and the detection column points at a rule or query shipped with the study where one exists. A [Navigator layer](../indicators/attack/navigator-layer.json) carries the same mapping for loading into the [ATT&CK Navigator](https://mitre-attack.github.io/attack-navigator/).

## Read this first

The map has limits, and they matter more here than for a conventional tool.

- **The technique is a label for a behaviour, not a feature of the tool.** ARTEX has no exploit library. A model drives a shell, a browser and standard tools, and decides what to type ([C042](../claims.yaml), C035). So most of what it does on a target is improvised and changes from run to run (C128). A row that says "ARTEX does T1046" means the model, given a shell, does what T1046 describes — not that ARTEX ships a scanner module you can fingerprint.
- **The durable signal is tempo, sequence and objective, not any single event.** Detecting an agent-run intrusion shifts the question from "does this event look malicious?" to "what was this identity trying to do, and did its behaviour match that?" (C201, C203). Read the map that way: the value is in the chains, not the ticks.
- **The model boundary is a detection surface.** When the agent uses the victim's own AI keys, sustained tool-driven activity from one identity is visible in model-API traffic, often to the provider when it isn't to the victim (C202, C205).
- **Everything here is a starting point.** As with the [indicators](../indicators/README.md), these rows were written from the code and from public reporting, not tested against your logs. Tune before you rely on them.

Each row's confidence is the status of the claims it cites: `code` (checked against the source), `source` (a public report), `inference` (our reasoning) or `secondary` (a report about someone else's work). Rows that rest on the wider tool class rather than ARTEX's own code say so.

## Mitigations that cut across

These recur, so they're stated once here rather than in every row. They don't depend on anything specific to ARTEX, which is the point: they hold against the whole class of agentic offensive tools (C168, C207).

- **Enforce scope outside the tool.** ARTEX asserts an authorisation nothing checks and keeps scope only in prompts (C081, C207). Boundaries that hold live in your network and infrastructure, not in the attacker's settings (C204).
- **Allow-list egress.** The default build won't stop data leaving (C085); assume the attacker's won't either. Control what can talk out, and to where.
- **Scope and shorten credentials.** Stolen long-lived keys fund the next stage of credential hunting (C126, C127). Short-lived, least-privilege credentials cut that chain.
- **Alert on machine speed.** Many tool calls per minute from one identity is the tool's native tempo (C203). Baseline it and alert on it.
- **Log internal apps.** A detection is only as good as the logs behind it; internal web apps and APIs often don't log requests at all (C213).

---

## Reconnaissance

| Technique | What ARTEX does | Claims | Detection | Mitigation |
| --- | --- | --- | --- | --- |
| **T1595 Active Scanning** | The standard image bundles nmap, netcat and an API-endpoint-discovery skill; the model enumerates whatever is reachable. Obscurity is no cover against a tool that enumerates everything (C195). | C040, C041, C195 | `sigma/web_request_claims_authorised_test.yml` — a request that calls itself an authorised test or names the engine. Watch one source touching many endpoints or hosts fast. | Cut exposed surface; make internal apps log requests; rate-limit and alert on enumeration. |

## Resource development

| Technique | What ARTEX does | Claims | Detection | Mitigation |
| --- | --- | --- | --- | --- |
| **T1588.002 Obtain Capabilities: Tool** | ARTEX is the obtained tool. It's easy to fingerprint in your own estate: an unauthenticated health check names the service and version, on port 8787 by default, and consoles are exposed at scale. | C100, C104, C121, C129 | `yara/artex.yar` for a copy on disk; the console fingerprints in `indicators.csv`; hunt port 8787 and the unauthenticated health endpoint on your own ranges. | Find and remove exposed consoles; block the port inbound; treat any internal host answering as the service as an incident. |

## Initial access

| Technique | What ARTEX does | Claims | Detection | Mitigation |
| --- | --- | --- | --- | --- |
| **T1190 Exploit Public-Facing Application** | The model exploits what it confirms; the database then holds, per confirmed vulnerability, a report with reproduction steps and exploit code for that target (so a seized instance is both a victim list and a set of exploits). Model-driven, varies per run. | C042, C181 | Behaviour over signature: a single identity moving from enumeration to a working request against one app at speed. ARTEX keeps a tally of WAF/403/CAPTCHA blocks and is told to try every way round them (C090, C091). | Patch; WAF; isolate public apps; alert on repeated blocked-then-retried requests from one source. |
| **T1078.004 Valid Accounts: Cloud Accounts** | Uses compromised long-lived keys to search cloud logs for more secrets and to abuse public sign-up pools. In the Bitrise intrusion, entry was through an internal bot unused since 2022 with no two-factor (C219). | C126, C127, C219 | `sigma/aws_long_term_key_unexpected_source.yml`, `sigma/azure_service_principal_unexpected_source.yml`, `sigma/gcp_service_account_key_unexpected_source.yml` — a known key or principal used from outside your own ranges. | Short-lived, scoped credentials; two-factor on every account including service and test bots; retire dormant accounts. |

## Execution

| Technique | What ARTEX does | Claims | Detection | Mitigation |
| --- | --- | --- | --- | --- |
| **T1059.004 Command and Scripting Interpreter: Unix Shell** | The shell is the capability. Planner, main agent and three workers get it by default; the engine's only hard floor is four catastrophic commands, and ARTEX sets no deny rules (C014, C015). Everything else is the model typing. | C035, C036, C042 | Not the commands (they vary) but the tempo and operator: bursts of shell activity from one identity with no human pace. | Least privilege on hosts; isolate anything that could be a target; alert on machine-speed command sequences. |

## Defense evasion

| Technique | What ARTEX does | Claims | Detection | Mitigation |
| --- | --- | --- | --- | --- |
| **T1036 Masquerading** | From v0.3.30, ARTEX's own web requests rotate 20 ordinary desktop user agents, and its agents are told not to send command-line tools' default headers but to reuse the target's own — the one stealth feature found in the code (C209). Older builds named the tool in the user agent, so those strings (`norma/0.4`, `artex-enrich/1.0`) now identify only old builds and past visits (C208, C210). Its prompts also assert an "authorised test" that nothing in code checks (C184), framing that can surface as a marker in request contents. | C184, C208, C209, C210 | `sigma/web_request_claims_authorised_test.yml` for the authorised-test or engine-name marker. Don't lean on user agents — current builds blend in, and the old tool names are for searching historical logs only. The durable surface is behaviour and the model-API boundary (C202, C205). | A user-agent masquerade defeats signature matching, not behavioural baselines: baseline each identity's request tempo and destinations, and watch egress and the model-API boundary, where the keys are yours. |

## Credential access

| Technique | What ARTEX does | Claims | Detection | Mitigation |
| --- | --- | --- | --- | --- |
| **T1552.001 Unsecured Credentials: Credentials in Files** | The model reads secrets it finds. In the Bitrise case it read build secrets that hadn't been marked secret (C219). Note the irony worth hunting: ARTEX leaves its *own* operator keys and database password in every agent's environment (C106). | C106, C219 | File-access patterns from an automated identity; a seized or exposed ARTEX instance exposes the operator's own keys. | Keep secrets out of files and environments; scope what any one identity can read. |
| **T1552.005 Unsecured Credentials: Cloud Instance Metadata API** | The engine's web fetch has no block on internal or private addresses, so the model can request internal and metadata endpoints. | C019 | Requests to metadata or internal addresses from an application identity that normally doesn't make them. | Enforce metadata-service hardening (IMDSv2 and equivalents); block internal fetches at the app layer. |
| **T1110 Brute Force** | Agentic abuse of sign-in, including the failed-attempt bursts seen before the Bitrise entry (C219). | C126, C219 | `sigma/signin_failure_burst.yml` — ten or more failed sign-ins for one account in five minutes. | Lockout and throttling; two-factor; alert on failure bursts across related accounts. |

## Discovery

| Technique | What ARTEX does | Claims | Detection | Mitigation |
| --- | --- | --- | --- | --- |
| **T1046 Network Service Discovery** | nmap and netcat in the image; the model scans. Raw scans bypass ARTEX's own recording proxy (C061), so they won't appear in the operator's capture but will on your network. | C041, C061 | Network monitoring sees the scan stage even when the agent later fails its goal (C131, C200). | Segment networks; alert on internal scanning from non-scanner hosts. |
| **T1526 Cloud Service Discovery** | Uses stolen keys to search cloud logs and map the account; Amazon describes planner/worker/verification agents sharing a knowledge graph of what they find (C127). | C126, C127 | Unusual read-heavy enumeration of cloud logging and inventory APIs by one identity. | Scope credentials; alert on broad `List`/`Describe`/log-reading bursts. |

## Lateral movement

These rest on public reporting of ARTEX campaigns, not on ARTEX's own reviewed code: the versions studied ship no lateral-movement module, so this is stolen valid accounts plus the model and the shell.

| Technique | What ARTEX does | Claims | Detection | Mitigation |
| --- | --- | --- | --- | --- |
| **T1550.001 Use Alternate Authentication Material: Application Access Token** | Compromised long-lived keys and already-issued tokens are reused to reach further services. In the Bitrise intrusion, disabling a key didn't recall the access tokens already minted from it, so revocation lagged the attacker (C219); in AWS, stolen long-lived keys were used to search cloud logs for more secrets (C126, C127). | C126, C127, C219 | `sigma/aws_long_term_key_unexpected_source.yml`, `sigma/azure_service_principal_unexpected_source.yml`, `sigma/gcp_service_account_key_unexpected_source.yml` — a known key or principal used from outside your own ranges; Bitrise reported this matched every stolen-key use it saw (C219). | Short-lived, scoped credentials; revocation that recalls issued tokens, not just the parent key; two-factor on service and test accounts; retire dormant accounts. |
| **T1021 Remote Services** | Model-improvised, not a shipped module: given valid accounts and the shell, the model reaches further hosts and services. Amazon describes planner, worker and verification agents sharing a knowledge graph of what they find, with stolen keys funding further hunting (C127). | C126, C127 | Behaviour, not signature: one identity reaching systems it doesn't normally touch, at machine tempo (C203). Internal apps must log requests for this to be visible at all (C213). | Segment networks; scope credentials tightly; two-factor on internal services; baseline and alert on an identity's first contact with a new system. |

## Collection and exfiltration

| Technique | What ARTEX does | Claims | Detection | Mitigation |
| --- | --- | --- | --- | --- |
| **T1530 Data from Cloud Storage / T1005 Data from Local System** | Model-improvised. The optional AI judge, off by default, explicitly does *not* treat reading password files, `.env` files, keys or whole databases as a reason to block (C183). | C183 | Large or unusual reads from an automated identity, read as part of a sequence rather than singly. | Scope data access; alert on bulk reads; separate sensitive stores. |
| **T1567 Exfiltration Over Web Service** | Findings can be sent out to Telegram, email, webhooks and three workplace chat apps; the built-in rule against piping data to another host ships switched off. | C064, C085 | Egress monitoring to messaging and webhook endpoints from server identities. | Allow-list egress; block unapproved outbound destinations. |

## Impact — the wider class, not ARTEX's own code

| Technique | What the class does | Claims | Detection | Mitigation |
| --- | --- | --- | --- | --- |
| **T1486 Data Encrypted for Impact / T1485 Data Destruction** | Shown by the agentic class, not found in ARTEX: the first documented autonomous-ransomware case (JADEPUFFER) ran an intrusion end to end — break-in, credential theft, lateral movement, encrypting a database and destroying the originals (C199). ARTEX's own destructive-command rules are *on* by default (C015, C085), so this row is about the threat class, included for completeness. | C199 | Rapid, automated file modification or deletion across a store; the same tempo signal as elsewhere. | Offline, tested backups; least privilege on data stores; alert on mass-modify operations. |

## Command and control

| Technique | What ARTEX does | Claims | Detection | Mitigation |
| --- | --- | --- | --- | --- |
| **T1071.001 Application Layer Protocol: Web Protocols** | The agent reaches targets over HTTP via the engine's web fetch and a Chromium browser. From v0.3.30 it rotates 20 ordinary desktop user agents and is told to reuse the target's own headers — the first stealth feature found — so old tool-name indicators now only catch old builds and visits (C208, C209, C210). | C041, C209, C210 | Behaviour, not user agent. The model boundary is the better surface: sustained tool-driven requests from one identity (C202, C205). Old names ("norma/0.4", "artex-enrich/1.0") are for searching historical logs only. | Monitor at the model-API boundary where keys are yours; egress control; behavioural web-traffic baselines. |

---

## What this map doesn't claim

It doesn't suggest ARTEX is more capable than the teardown says, or that any row is a fixed, fingerprintable module. The through-line of the study holds here: the defences that work sit outside the tool, and they're the same ones that hold against the whole class (C168, C207). Use the map to check your coverage against techniques you already know, then weight your effort toward the behavioural and sequence-based detections, because those are the ones ARTEX can't easily change (indicators [README](../indicators/README.md)).

Found a technique we've mis-mapped, or one we've missed? [Open an issue](../../../.github/ISSUE_TEMPLATE/challenge-a-claim.yml) with the claim ID. Anything that would help an attacker goes through the [private route](../../../SECURITY.md).
