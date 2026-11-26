# How ARTEX's prompts are designed

<!--if-brand-->**Café Security Research**<!--/if-brand--><!--if-named:**{name}** · Café Security Research--> · Version 1.1, 26 November 2026

Part of the study [ARTEX: what the code says](../README.md). Every finding here is a numbered claim in [`claims.yaml`](../claims.yaml), with its evidence. Please cite as: <!--if-brand-->Café Security Research<!--/if-brand--><!--if-named:{cite}--> (2026). *How ARTEX's prompts are designed* (v1.0).<!--if-named: Café Security Research.-->

ARTEX's own code is mostly plumbing. What it does to a target comes from an AI model following written instructions, its prompts (C042). This report describes how those instructions are built and what they tell the agents to do, for **CISOs, security teams and AI providers**. It describes them rather than reproducing them. The prompts are portable: copied out, they would work in other agent tools, and a translated, tidied-up copy on a trusted site would be more useful to an attacker than the scattered originals. Evidence below quotes only a few words to locate each line; anyone checking can read the full text at the pinned commit ([publication policy](../../../PUBLICATION_POLICY.md)).

## In brief

- **The instructions are a setting, not code.** Every built-in agent's prompt lives in ARTEX's database and can be rewritten from the console (C170). The rule to stay within scope is in the part an operator can edit (C171).
- **"Authorised" is something the prompts say, not something the system checks.** The main prompts all call the work an authorised penetration test; nothing verifies that (C184).
- **The design is about persistence and proof.** The planner must always keep work going while the goal is unmet, and push promising entry points deep (C175, C176). Workers record a vulnerability only when they've triggered it themselves (C177).
- **Each confirmed finding gets a ready-made exploit.** A report-writing agent runs automatically on every finding and saves reproduction steps and exploit code with it (C180). An ARTEX database is a victim list with exploits attached (C181).
- **Nothing tells the attacking agents to distrust what targets send.** In v0.3.15, the only prompt that guards against injected instructions protects ARTEX's optional safety judge, not its agents (C182, C093).

## How the prompts are built

Each built-in agent (goals, planner, main agent, worker, the standalone pentest agent and a platform assistant) has an instruction template. The built-in templates are written in Chinese (C217). At first start ARTEX copies the built-in text into its database, and from then on the database copy is what runs. An operator can edit it in the console; if an edit breaks the template, ARTEX falls back to the original (C170).

The code adds a few sections after the editable text that editing can't remove. They're housekeeping: where to save files, how to use the recorded traffic, and how the goals agent records scope (C171). The safety-relevant wording, such as the worker's rule to act only within the authorised scope, sits in the editable part.

Operator constraints ("don't brute-force", "only this host") are added to the planner's and workers' instructions as a high-priority block. That's on by default but is a setting for each role. The worker's instructions say the block appears at the top; the code puts it at the end (C172). Either way, it's text the model is asked to check itself against, not a control (C081).

Two choices show the designers optimising for cost and reliability. The planner's live situation goes into the user message so its long instructions stay identical between rounds and can be cached. A worker's task does the opposite: it stays in the instructions so that summarising a long run can never lose it (C178).

## What the prompts tell the agents to do

**Goals agent.** It turns the operator's request into goals, pulls out any constraints, and records the target scope under a minimum-scope rule: a named subdomain is never widened to the whole domain (C173). This is the most careful scope handling in ARTEX. But the scope list it starts then grows by itself, because every asset a worker records, and every asset the planner hands out, is added. The code calls that list the task's authorisation edge, yet nothing checks it before an action (C174).

**Planner.** It wakes whenever the shared record changes. It must keep at least one line of work going while the goal is unmet, so a task doesn't stall. It sends at most four new directions per round, prefers taking a high-value entry point deeper over testing everything shallowly (C175), and keeps two or three genuinely different routes going rather than settling early. Operator constraints take precedence over that variety, and it must check measured results before declaring a goal met (C176).

**Workers.** Each takes one task, writes results back as it goes, and records a vulnerability only with reproducible evidence from its own run; a version match isn't enough (C177). A first block isn't treated as the end of a route (C090).

**Standalone pentest agent.** It plans and acts alone, so it's told to challenge its own results by triggering each finding again a different way before claiming success (C179).

**Report writer.** Set up automatically at first start, it runs every time a vulnerability is recorded, up to five at once, and saves a report with reproduction steps and ready-to-run exploit code alongside the finding (C180).

**Safety judge (off by default).** If switched on, it reviews tool calls the rules didn't match. It's the one prompt in v0.3.15 that tells a model to treat its input as untrusted and ignore instructions inside it (C182). Its policy blocks only irreversible damage to production systems; reading password files, keys or whole databases is explicitly allowed (C183).

**In v0.3.30.** A new, optional agent turns captured text into structured accounts, passwords, tokens and cookies. It's off unless two settings are switched on, and its instructions do treat input as untrusted; the attacking agents' instructions still don't (C186).

## What this means for defenders

| What the prompts do | What it means | What to do |
| --- | --- | --- |
| Keep work going while the goal is unmet; go deep on promising entry points (C175, C176) | Expect persistence and pivoting from a foothold, not a single scan | Alert on sustained, varied activity from one source; contain fast when an entry point is hit |
| Record findings only with proof from the agent's own run (C177) | Findings are real, tested access, not scanner noise | Treat signs of ARTEX activity as a possible real compromise, not routine scanning |
| Write an exploit report for every finding (C180, C181) | A seized or exposed ARTEX instance holds exploit code for each victim | In an investigation, preserve the database as evidence; notify the organisations it lists |
| Rely on prompt text for scope and authorisation (C171, C174, C184) | Changing behaviour needs no code change | Don't take a vendor's or operator's prompt-level safeguards as assurance; enforce limits outside the tool (C185) |
| Don't tell the agents to distrust target content (C093, C182) | Content on your systems may influence the agents | Untested here (C094); a candidate for controlled defensive research |

**For AI providers.** The prompts assert that every engagement is authorised (C184), and nothing in ARTEX checks it. A claim of authorisation in a system prompt says nothing about whether one exists. Signals at the provider's end, such as sustained tool-driven activity against third-party systems, carry more weight than what the prompt says.

**For anyone running an AI pentesting tool, including legitimate ones.** The same lesson applies: scope, approval and data-handling limits belong in the network, credentials and infrastructure around the tool, not only in its instructions (C185, C141).

## Limits

This is a reading of the prompts and the code that assembles them in v0.3.15, with spot checks in v0.3.30. It doesn't show how well any model follows them; that depends on the model and wasn't tested. Operators can rewrite every editable prompt, so a running instance may behave differently.

## Revision history

- **1.0, 23 November 2026.** First version.
- **1.1, 26 November 2026.** Noted that the built-in templates are written in Chinese (C217), and that v0.3.30 tells its agents to copy the target's own request headers (C209).
