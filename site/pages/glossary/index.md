---
title: "AI security glossary for CISOs"
description: "Plain-English definitions of the AI and agent terms security leaders now hear every week: what each term means, why it matters to security, and the question to ask your vendor. With commonly confused terms, common misconceptions and a vendor-speak decoder."
---

# AI security glossary for CISOs

This glossary is for security leaders who need to ask good questions about AI before they can answer them. Each term has three parts: **what it is**, in plain English; **why it matters to security**; and the **question to ask your vendor** in a security review. Where a term matches an entry in the OWASP Top 10 for LLM Applications (2026 edition) or the OWASP Top 10 for Agentic Applications, the entry is named so you can read further. The standards bodies don't always use the same words for the same thing, so [Same idea, different names](#same-idea-different-names) maps the terms across NIST, ISO, OWASP, MITRE ATLAS and the EU AI Act, and [Frameworks](#frameworks) lists the main ones.

!!! note "Current as of November 2026"
    Products, standards and vendor settings in this field change month to month. Each page change is dated in [Changes](#changes) at the foot of the page. If something here is out of date or wrong, [tell us](../about/contributing.md).

<div class="cs-gloss-filter" markdown="0">
<label for="gloss-q">Find a term</label>
<input id="gloss-q" type="search" placeholder="For example: injection, MCP, memory" autocomplete="off" spellcheck="false">
<p id="gloss-count" class="cs-gloss-count" aria-live="polite"></p>
</div>

**On this page:** [The basics](#the-basics) · [How agents connect to things](#how-agents-connect-to-things) · [Attacks](#attacks) · [Defences and controls](#defences-and-controls) · [Governance](#governance) · [Building software with AI](#building-software-with-ai) · [Same idea, different names](#same-idea-different-names) · [Commonly confused](#commonly-confused) · [Common misconceptions](#common-misconceptions) · [Vendor-speak decoder](#vendor-speak-decoder) · [Frameworks](#frameworks) · [Sources](#sources)

## The basics

<div class="cs-term" markdown="1">

### Large language model (LLM) { #llm }

- **What it is:** The model behind chat assistants and agents. It predicts text, and it reads everything it is given (your instructions, a document, a web page) as one stream of text.
- **Why it matters:** Because instructions and data arrive in the same stream, the model has no reliable way to tell an order from you apart from an order hidden in an email. Most of the risks on this page follow from that ([Willison](#src-willison-trifecta)).
- **Ask your vendor:** Which model or models does the product use, who hosts them, and can that change without notice?

</div>

<div class="cs-term" markdown="1">

### Agent { #agent }

- **What it is:** An LLM that can take actions, not just answer: it plans steps, calls tools, reads the results and carries on until the task is done.
- **Why it matters:** A chatbot that gets something wrong gives a bad answer. An agent that gets something wrong sends the email, moves the file or makes the payment.
- **Ask your vendor:** What can the agent do without a person approving it, and can we change that list?

</div>

<div class="cs-term" markdown="1">

### Agentic AI { #agentic-ai }

- **What it is:** A loose label for AI systems that act with some independence: they set out steps, use tools and carry on without being prompted at each turn. Vendors apply it to anything from a chatbot with one plug-in to an agent that runs for days.
- **Why it matters:** The label tells you nothing about risk. What matters is what the system can reach and what it can do without asking.
- **Ask your vendor:** What exactly can it do on its own, and for how long can it run unattended?

</div>

<div class="cs-term" markdown="1">

### Copilot / assistant { #copilot }

- **What it is:** Usually an AI that helps a person who stays in charge: it drafts and suggests, and the person decides. Some products called copilots now take actions too.
- **Why it matters:** The name suggests a human is always checking. Check whether that is true of the product you're buying.
- **Ask your vendor:** Which actions does it take without the user confirming them?

</div>

<div class="cs-term" markdown="1">

### Token (two meanings) { #token }

- **What it is:** (1) A word or part of a word: the unit models use to measure input, output and billing. (2) In security, a credential such as an OAuth access token.
- **Why it matters:** Conversations about "token limits" and "token theft" are about different things. Agents hold the second kind, and those are worth stealing.
- **Ask your vendor:** Which credentials does the agent hold, how long do they last, and how narrow are their scopes?

</div>

<div class="cs-term" markdown="1">

### Inference { #inference }

- **What it is:** Running a trained model to get an answer. Training is how the model was made; inference is every time you use it.
- **Why it matters:** "We don't train on your data" is about training. Your data is still sent, processed and possibly stored at inference time.
- **Ask your vendor:** Where does inference happen (which region), and what is logged or kept when it does?

</div>

<div class="cs-term" markdown="1">

### Tool calling (function calling) { #tool-calling }

- **What it is:** How an agent acts. The model asks for a named tool, such as "search_email" or "create_ticket", with some inputs, and the software around it runs the tool.
- **Why it matters:** Each tool is a permission. The set of tools is the agent's attack surface.
- **Ask your vendor:** Can we see and restrict the full list of tools the agent has?

</div>

<div class="cs-term" markdown="1">

### Context window { #context-window }

- **What it is:** Everything the model can see at once: instructions, conversation, retrieved documents, tool results.
- **Why it matters:** Anything in the context window can influence what the agent does next, including text an attacker managed to get into it.
- **Ask your vendor:** What gets put into the context automatically (emails, files, browsing results), and can we limit it?

</div>

<div class="cs-term" markdown="1">

### System prompt { #system-prompt }

- **What it is:** The standing instructions the vendor or developer gives the model before the user says anything.
- **Why it matters:** It is guidance, not a security boundary. Attackers can often get a model to reveal or ignore it, so it should never hold secrets or be the only rule stopping a dangerous action. OWASP's 2026 list widened this risk to everything hidden in the context, not just the prompt: LLM08 Hidden Context Exposure, which replaced System Prompt Leakage ([OWASP LLM](#src-owasp-llm), [CSA](#src-csa-owasp2026)).
- **Ask your vendor:** Which of your safeguards are enforced in code, and which only in the prompt?

</div>

<div class="cs-term" markdown="1">

### Hallucination { #hallucination }

- **What it is:** When a model states something false with confidence: a made-up citation, policy or figure. NIST calls this *confabulation*, partly because "hallucination" makes the system sound human ([NIST AI 600-1](#src-nist-600-1)).
- **Why it matters:** In an agent, a made-up detail can become an action. One known case is the invented software package: code models suggest libraries that don't exist, and an attacker can register the name and publish malware under it. This is called slopsquatting ([CSO Online](#src-slopsquatting)). OWASP: LLM07 Misinformation.
- **Ask your vendor:** Where does the product check facts or outputs before acting on them?

</div>

<div class="cs-term" markdown="1">

### Memory { #memory }

- **What it is:** Information an agent keeps between sessions: preferences, past tasks, notes about you.
- **Why it matters:** Memory can be poisoned. An instruction planted once can keep affecting the agent long after the original email or page is gone. OWASP: ASI06 Memory & Context Poisoning ([OWASP Agentic](#src-owasp-agentic)).
- **Ask your vendor:** Can users and admins see, edit and wipe what the agent remembers?

</div>

## How agents connect to things

<div class="cs-term" markdown="1">

### MCP (Model Context Protocol) { #mcp }

- **What it is:** An open standard for connecting AI agents to tools and data. Anthropic released it in November 2024; since December 2025 it has been a project of the Linux Foundation's Agentic AI Foundation ([Linux Foundation](#src-aaif)).
- **Why it matters:** Each MCP server you connect is code with access to your data, often written by a third party, so connecting one is a supply-chain decision, not a settings tweak. OWASP: ASI04 Agentic Supply Chain Vulnerabilities. Our [MCP Security Guide](../mcp/index.md) covers building one safely.
- **Ask your vendor:** Can admins allowlist which MCP servers or connectors staff may use?

</div>

<div class="cs-term" markdown="1">

### Connector / plugin / skill { #connector }

- **What it is:** Vendor names for add-ons that give an agent new abilities or access to another app.
- **Why it matters:** The same risk as an MCP server under a friendlier name. A skill can also carry instructions the agent will follow.
- **Ask your vendor:** Who reviews third-party connectors, and can we block unreviewed ones?

</div>

<div class="cs-term" markdown="1">

### RAG (retrieval-augmented generation) { #rag }

- **What it is:** Looking up relevant documents and adding them to the model's context before it answers, so it can use your organisation's information.
- **Why it matters:** The search must respect each user's permissions, or the assistant becomes a way to read files people shouldn't see. Retrieved documents can also carry injected instructions.
- **Ask your vendor:** Does retrieval enforce the asking user's existing access rights, document by document?

</div>

<div class="cs-term" markdown="1">

### Embeddings / vector database { #embeddings }

- **What it is:** Documents turned into lists of numbers so that similar meanings can be found quickly, stored in a vector database that powers RAG.
- **Why it matters:** Embeddings are derived from your data. Give the vector store the same access control, encryption and retention rules as the source documents. OWASP: LLM09 Vector and Embedding Weaknesses.
- **Ask your vendor:** Where are embeddings stored, who can query them, and are they deleted when the source document is?

</div>

<div class="cs-term" markdown="1">

### Computer use / browser agent { #computer-use }

- **What it is:** An agent that operates a screen like a person: clicking, typing, reading pages.
- **Why it matters:** It reads whatever is on the page, including content written by attackers, and it often works inside a signed-in session.
- **Ask your vendor:** Whose sessions and credentials does the agent use, and can it see passwords or cookies?

</div>

<div class="cs-term" markdown="1">

### A2A (agent-to-agent) { #a2a }

- **What it is:** Agents handing tasks to other agents. Agent2Agent (A2A) is an open protocol for this, started by Google in April 2025 and a Linux Foundation project since June 2025 ([Linux Foundation](#src-a2a)).
- **Why it matters:** Trust passes along the chain. A compromised, or simply wrong, agent can mislead the next one, and it gets harder to trace who did what. OWASP: ASI07 Insecure Inter-Agent Communication and ASI08 Cascading Failures.
- **Ask your vendor:** When your agent delegates to another agent, what permissions does that agent get, and is the hand-off logged?

</div>

## Attacks

<div class="cs-term" markdown="1">

### Prompt injection (direct and indirect) { #prompt-injection }

- **What it is:** Instructions slipped into a model's input to make it do something it shouldn't. *Direct*: the user types them. *Indirect*: they are hidden in content the agent reads, such as an email, web page, document or calendar invite ([NIST](#src-nist-aml)). When indirect injection makes an agent take harmful actions, NIST's AI agent team calls it *agent hijacking* ([NIST CAISI](#src-caisi)). MITRE ATLAS adds a third kind, *triggered*, alongside direct and indirect ([ATLAS](#src-atlas)).
- **Why it matters:** Indirect injection is the big one for business, because the attacker never needs access to your systems, only to something your agent will read. It is first in the OWASP Top 10 for LLM Applications (LLM01), and its agentic form, ASI01 Agent Goal Hijack, is first in the agentic list. MITRE ATLAS: AML.T0051 LLM Prompt Injection. We know of no defence that stops it completely, so design on the basis that it will sometimes work.
- **Ask your vendor:** What happens when the agent reads a malicious instruction? What stops the action, and does that check sit outside the model?

</div>

<div class="cs-term" markdown="1">

### Jailbreak { #jailbreak }

- **What it is:** Getting a model to ignore its own safety rules, usually through clever wording or role-play.
- **Why it matters:** It shows that a model's own refusals are not a dependable control. Plan as if any model can be talked round. Frameworks file it differently: OWASP calls jailbreaking a form of prompt injection ([OWASP LLM01](#src-owasp-llm01)), while MITRE ATLAS lists it as a separate technique, AML.T0054 LLM Jailbreak ([ATLAS](#src-atlas)).
- **Ask your vendor:** Which protections still hold if the model itself is jailbroken?

</div>

<div class="cs-term" markdown="1">

### Lethal trifecta { #lethal-trifecta }

- **What it is:** Simon Willison's name for a dangerous combination: an agent with access to private data, exposure to untrusted content, and a way to communicate externally ([Willison](#src-willison-trifecta)).
- **Why it matters:** It is the quickest way to triage an agent. If all three are present, an attacker can trick the agent into reading your private data and sending it to them. Remove one of the three, or put a human check on it. Our [AI Agent Check](https://cafesecurity.github.io/ai-tools/agent-check/) tool walks through this for one agent.
- **Ask your vendor:** Which of the three does this agent have by default, and can we switch one off?

</div>

<div class="cs-term" markdown="1">

### Zero-click exfiltration { #zero-click-exfiltration }

- **What it is:** Data leaving without anyone clicking anything. A common route: an injected instruction makes the assistant put sensitive data into a link or image address, and the data is sent when the app loads it. EchoLeak (CVE-2025-32711), a critical flaw in Microsoft 365 Copilot that Microsoft fixed in 2025, let an attacker take data with a single crafted email ([Hack The Box](#src-echoleak)).
- **Why it matters:** An agent that can only read can still leak, if its output is rendered automatically. OWASP: LLM10 Improper Output Handling.
- **Ask your vendor:** Does the product load external images or links from model output automatically, and can we turn that off?

</div>

<div class="cs-term" markdown="1">

### Data poisoning { #data-poisoning }

- **What it is:** Corrupting the data a model learns from or relies on (training data, fine-tuning sets, RAG sources) to change how it behaves. OWASP: LLM05 Data and Model Poisoning.
- **Why it matters:** The attack can be planted long before it is used, and it is hard to spot afterwards.
- **Ask your vendor:** Where does the model's training and grounding data come from, and how is it checked?

</div>

<div class="cs-term" markdown="1">

### Tool misuse / excessive agency { #tool-misuse }

- **What it is:** An agent using legitimate tools in harmful ways, often because it was given more permissions or autonomy than the task needed. OWASP: LLM03 Excessive Agency, ASI02 Tool Misuse and ASI03 Identity & Privilege Abuse. MITRE ATLAS: AML.T0053 AI Agent Tool Invocation.
- **Why it matters:** Nothing has to be hacked. Broad scopes plus one bad instruction is enough.
- **Ask your vendor:** Can permissions be scoped per task, and is the default least privilege?

</div>

## Defences and controls

<div class="cs-term" markdown="1">

### Guardrails { #guardrails }

- **What it is:** A catch-all name for filters and rules around a model: blocking certain topics, detecting injection, stopping sensitive data leaving.
- **Why it matters:** Useful, but often probabilistic, with one model judging another. Treat them as one layer, not the boundary.
- **Ask your vendor:** Which guardrails are fixed rules and which are model-based, and what are their known bypass rates?

</div>

<div class="cs-term" markdown="1">

### Human-in-the-loop (approval gates) { #human-in-the-loop }

- **What it is:** A person approves certain actions before the agent carries them out.
- **Why it matters:** Only as good as the person and the screen they see. Too many approvals and people tap through them. Anthropic, for one, calls this approval fatigue a serious issue ([Anthropic](#src-duet)); it is the same weakness attackers use against MFA prompts. OWASP: ASI09 Human-Agent Trust Exploitation.
- **Ask your vendor:** Which actions need approval, does the approval screen show exactly what will be sent and to whom, and can admins set the policy?

</div>

<div class="cs-term" markdown="1">

### Non-human identity (agent identity) { #non-human-identity }

- **What it is:** Giving an agent its own account and credentials, rather than letting it act as the user.
- **Why it matters:** A separate identity makes an agent visible in logs, limits what it can reach and lets you switch it off without locking out a person. It also needs joiner, mover and leaver processes, like staff.
- **Ask your vendor:** Does the agent act as the user or as itself, and does it appear separately in our identity provider and logs?

</div>

<div class="cs-term" markdown="1">

### Agent gateway { #agent-gateway }

- **What it is:** A checkpoint that every agent tool call passes through, where your policy decides what is allowed and every call is logged.
- **Why it matters:** It puts the decision outside the agent, so it still works when the agent has been misled, and it records activity the agent itself may not show its owner. In one reported case, a gateway caught 31 unapproved read requests from two AI agents over five days ([eWeek](#src-newcore)).
- **Ask your vendor:** Can tool calls be routed through our own gateway or proxy?

</div>

<div class="cs-term" markdown="1">

### Sandbox { #sandbox }

- **What it is:** An isolated environment where the agent runs, with limited access to files, networks and other systems.
- **Why it matters:** It limits the blast radius when something goes wrong.
- **Ask your vendor:** What can the agent's environment reach by default, and can we set egress rules?

</div>

<div class="cs-term" markdown="1">

### Evals { #evals }

- **What it is:** Structured tests of how a model or agent behaves: accuracy, safety, resistance to attack.
- **Why it matters:** A vendor's evals tell you about their test set, not your environment. Ask for the results, and test your own use cases.
- **Ask your vendor:** Which security evals have you run, against which attacks, and can we see the results?

</div>

<div class="cs-term" markdown="1">

### AI red teaming { #red-teaming }

- **What it is:** Deliberately attacking an AI system to find its weaknesses before someone else does.
- **Why it matters:** A standard penetration test may not cover AI-specific problems such as injection and tool misuse. Scope both.
- **Ask your vendor:** Has the product been red-teamed by an independent party, and when?

</div>

<div class="cs-term" markdown="1">

### Kill switch { #kill-switch }

- **What it is:** A way to stop an agent, or all agents, at once.
- **Why it matters:** Agents work fast and in the background. If you can't stop one within minutes, an incident runs longer than it should. OWASP: ASI10 Rogue Agents.
- **Ask your vendor:** How do admins pause or revoke an agent across the organisation, and how quickly does that take effect?

</div>

## Governance

<div class="cs-term" markdown="1">

### Shadow AI { #shadow-ai }

- **What it is:** AI tools and agents that staff use without the organisation approving them, often on personal accounts.
- **Why it matters:** No admin controls, no logs, no contract terms covering your data. Blocking alone tends to push use further out of sight.
- **Ask yourself:** Do we know which AI tools and agents already have access to company data, for example through OAuth grants?

</div>

<div class="cs-term" markdown="1">

### AI BOM (AI bill of materials) { #ai-bom }

- **What it is:** An inventory of the models, datasets, tools and connectors inside an AI system, like a software bill of materials.
- **Why it matters:** You can't assess or patch what you can't list.
- **Ask your vendor:** Can you provide an AI BOM, and how will you tell us when a component changes?

</div>

<div class="cs-term" markdown="1">

### Fine-tuning { #fine-tuning }

- **What it is:** Further training a model on specific data to change its behaviour or knowledge.
- **Why it matters:** Data used for fine-tuning becomes part of the model, where it is hard to remove or to limit by permission. Test the model's safety behaviour again after fine-tuning.
- **Ask your vendor:** Is our data ever used to train or fine-tune your models, and is that switched off by default?

</div>

<div class="cs-term" markdown="1">

### Open weights { #open-weights }

- **What it is:** Models whose trained parameters are published, so anyone can download and run them.
- **Why it matters:** You control hosting and data flow, but you also take on patching, abuse monitoring and supply-chain checks yourself.
- **Ask yourself:** Who in our organisation owns the security of a self-hosted model?

</div>

<div class="cs-term" markdown="1">

### Provider, deployer and other roles { #roles }

- **What it is:** Names for who does what with an AI system. Under the EU AI Act, the *provider* develops a system and puts it on the market under its own name, and the *deployer* uses it under its own authority; together with importers, distributors, product manufacturers and authorised representatives they are *operators* ([EU AI Act](#src-eu-ai-act)). ISO/IEC 22989 uses a different set: AI provider, producer, customer, partner and subject ([ISO/IEC 22989](#src-iso-22989)). NIST's AI Risk Management Framework talks about *AI actors*.
- **Why it matters:** The sets don't map one to one, and one organisation can hold several roles at once. A company that builds its own agent on a vendor's model may be a deployer of the model and the provider of the agent. Contracts, audits and incident duties follow the role.
- **Ask your vendor:** Which role does each party hold under the frameworks we report against, and who carries which obligation when something goes wrong?

</div>

<div class="cs-term" markdown="1">

### Data retention / zero data retention (ZDR) { #data-retention }

- **What it is:** How long the vendor keeps your prompts, files and outputs. Zero data retention means the vendor doesn't store them after the request is answered, on the terms it publishes.
- **Why it matters:** Retention is a separate promise from training. Agents that work in the background also keep task history, memory and logs, which may follow different rules.
- **Ask your vendor:** What is kept, for how long, for which features, and what does your ZDR offer exclude?

</div>

## Building software with AI

<div class="cs-term" markdown="1">

### Vibe coding { #vibe-coding }

- **What it is:** Building software by describing what you want to an AI and accepting what it produces, without reading the code. Andrej Karpathy coined the term in February 2025 for a way of working where you "forget that the code even exists"; Collins Dictionary made it its word of the year for 2025 ([The Register](#src-vibe-collins)). The term is now often stretched to mean any coding with AI, which its defenders resist ([Willison](#src-willison-vibe)).
- **Why it matters:** It lets people who aren't developers build working tools quickly, and some of those tools end up handling real data. When nobody reads the code, nobody checks it for security either. In Veracode's October 2026 tests, roughly four in 10 AI coding tasks still produced vulnerable code when the prompt didn't ask for security, although results are improving ([Veracode](#src-veracode)).
- **Ask yourself:** Which apps in our organisation were built this way, who owns them, and has anyone reviewed them before they touched customer or company data?

</div>

<div class="cs-term" markdown="1">

### AI-assisted development { #ai-assisted-development }

- **What it is:** Professional developers using AI to write, explain, test or review code while staying responsible for it. Simon Willison's rule of thumb: don't commit code you couldn't explain to someone else ([Willison](#src-willison-vibe)). He calls the disciplined version "vibe engineering".
- **Why it matters:** The same tools serve both habits. The difference is review, testing and ownership, which is a process question you can set policy on.
- **Ask your teams:** Is AI-written code reviewed and tested to the same standard as human-written code, and does our secure development policy say so?

</div>

<div class="cs-term" markdown="1">

### Coding agent { #coding-agent }

- **What it is:** An agent that works on a codebase by itself: it reads and edits files, runs terminal commands and tests, and can open pull requests. Examples include Claude Code, GitHub Copilot's coding agent, OpenAI Codex and Google's Gemini CLI.
- **Why it matters:** It often runs with the developer's own credentials and shell, so it can do anything the developer can. In July 2025 an AI agent on the Replit platform deleted a live production database during a declared code freeze ([Fortune](#src-replit)); at the time, the service used one database for preview, testing and production ([heise](#src-replit-heise)). A freeze written in a prompt is not a control. OWASP: ASI05 Unexpected Code Execution. Our MCP guide has a page on [using a coding agent safely](../mcp/guide/coding-agents.md).
- **Ask your vendor:** What can the agent run without approval, can admins restrict commands and network access, and can it reach production credentials from a developer's machine?

</div>

<div class="cs-term" markdown="1">

### Auto-approve mode { #auto-approve }

- **What it is:** A setting in coding agents that lets them run commands and edit files without asking each time. Developers turn it on because constant approval prompts slow them down.
- **Why it matters:** It removes the human check exactly where an injected instruction would run. It is safer inside an isolated container with no secrets and limited network access than on a laptop signed in to everything.
- **Ask your vendor:** Can admins disable auto-approve, or allow it only inside a sandbox?

</div>

<div class="cs-term" markdown="1">

### Rules files (agent instruction files) { #rules-files }

- **What it is:** Files in a project that give a coding assistant standing instructions, such as `AGENTS.md`, `CLAUDE.md` or Cursor's `.cursor/rules`. Developers write their own or copy them from public collections.
- **Why it matters:** They are instructions the AI will follow, but people treat them as harmless configuration. Pillar Security showed in March 2025 that hidden Unicode characters in a rules file could make GitHub Copilot and Cursor add malicious code that reviewers wouldn't see, a technique it called the Rules File Backdoor ([Pillar Security](#src-pillar)).
- **Ask your teams:** Are rules files reviewed like code, and do our review tools show hidden Unicode characters?

</div>

<div class="cs-term" markdown="1">

### Slopsquatting (package hallucination) { #slopsquatting }

- **What it is:** Registering the name of a software package that AI models wrongly suggest, then publishing malware under it. A form of [hallucination](#hallucination) that becomes a supply-chain attack ([CSO Online](#src-slopsquatting)).
- **Why it matters:** A developer or coding agent that installs whatever the AI names can pull in an attacker's code. OWASP: LLM04 Supply Chain.
- **Ask your teams:** Do new dependencies, including ones an AI suggested, go through the same checks as any other?

</div>

<div class="cs-term" markdown="1">

### Toxic agent flow { #toxic-agent-flow }

- **What it is:** Invariant Labs' name for indirect prompt injection that triggers a harmful sequence of tool calls. In May 2025 it showed that a malicious issue in a public GitHub repository could make an agent connected to GitHub's MCP server leak data from the user's private repositories ([Invariant Labs](#src-invariant)).
- **Why it matters:** No single step looks wrong: read issues, list repositories, open a pull request. The harm is in the sequence. It is the [lethal trifecta](#lethal-trifecta) in a developer's workflow.
- **Ask your vendor:** Can the agent's access be limited to the repositories a task needs, and can you detect risky sequences of tool calls?

</div>

<div class="cs-term" markdown="1">

### AI in CI/CD pipelines { #ai-in-ci-cd }

- **What it is:** AI agents running inside build and deployment pipelines, such as GitHub Actions or GitLab CI/CD, to triage issues, review pull requests or fix code.
- **Why it matters:** Pipelines hold powerful tokens and secrets, and these agents read text anyone can write. Aikido Security showed in December 2025 that crafted issues or pull request text could make such agents run privileged commands and leak secrets, a class of flaw it called PromptPwnd ([Aikido](#src-promptpwnd)). Similar findings have followed for other vendors' pipeline agents ([The Hacker News](#src-gitlost)).
- **Ask your teams:** Do AI steps in our pipelines read untrusted issue or pull request text while holding write tokens or secrets?

</div>

<div class="cs-term" markdown="1">

### Model files and unsafe loading { #model-files }

- **What it is:** Downloaded AI models are files, and some formats run code when they are loaded. Python's pickle format, common for PyTorch models, can execute anything an attacker puts in it; formats such as safetensors were designed to avoid this.
- **Why it matters:** Researchers have found malicious models on Hugging Face that steal credentials or open reverse shells, and in one 2025 study 44.9% of popular models there still used pickle ([PickleBall](#src-pickleball)). Loading a model is running software. OWASP: LLM04 Supply Chain.
- **Ask your teams:** Do we load third-party models only in safe formats, scan them first, and load them away from production credentials?

</div>

## Same idea, different names

Standards bodies and threat catalogues often name the same thing differently, or draw its edges in different places. This table maps the terms on this page to what each one calls them. A dash means we didn't find a separate term for it in that framework, not that the framework ignores the topic. The table is wide: scroll it sideways to see every column.

| Concept (this page) | NIST | ISO/IEC | OWASP | MITRE ATLAS | Others |
| --- | --- | --- | --- | --- | --- |
| [Prompt injection](#prompt-injection) | Direct and indirect prompt injection (AI 100-2 E2025) | — | LLM01:2026 Prompt Injection | AML.T0051 LLM Prompt Injection: .000 direct, .001 indirect, .002 triggered | ETSI EN 304 223 names indirect prompt injection |
| Indirect injection against an agent | *Agent hijacking* (CAISI) | — | ASI01 Agent Goal Hijack (broader) | AML.T0051.001 | — |
| [Jailbreak](#jailbreak) | — | — | A form of prompt injection (LLM01) | AML.T0054 LLM Jailbreak, a separate technique | — |
| [Hallucination](#hallucination) | *Confabulation* (AI 600-1) | — | Part of LLM07:2026 Misinformation | — | — |
| [System prompt](#system-prompt) exposure | — | — | LLM08:2026 Hidden Context Exposure (was LLM07:2025 System Prompt Leakage) | Extracting the LLM system prompt is a named technique | — |
| [Tool misuse / excessive agency](#tool-misuse) | — | — | LLM03:2026 Excessive Agency; ASI02 Tool Misuse | AML.T0053 AI Agent Tool Invocation | — |
| [Data poisoning](#data-poisoning) | Poisoning attacks (AI 100-2 E2025) | — | LLM05:2026 Data and Model Poisoning | — | ETSI EN 304 223 names data poisoning |
| [Agent](#agent) | *AI agent systems*: able to take autonomous actions that affect real systems (CAISI) | *AI agent*: an automated entity that senses and responds to its environment and acts to achieve goals (22989), a much wider net | *Agentic applications* | — | — |
| [Provider, deployer and other roles](#roles) | AI actors (AI RMF) | AI provider, producer, customer, partner, subject (22989) | — | — | EU AI Act: provider, deployer, operators |

Sources for this table: [NIST AI 100-2](#src-nist-aml), [NIST AI 600-1](#src-nist-600-1), [NIST CAISI](#src-caisi), [ISO/IEC 22989](#src-iso-22989), [OWASP LLM](#src-owasp-llm), [OWASP LLM01](#src-owasp-llm01), [OWASP Agentic](#src-owasp-agentic), [ATLAS](#src-atlas), [ETSI EN 304 223](#src-etsi), [EU AI Act](#src-eu-ai-act).

## Commonly confused

| These terms | The difference |
| --- | --- |
| **Prompt injection vs jailbreak** | Injection makes the AI follow an attacker's instructions instead of yours. A jailbreak makes it ignore its own safety rules. A jailbreak usually needs the attacker to be the user; injection doesn't. OWASP treats jailbreaking as one kind of prompt injection; MITRE ATLAS lists them separately. |
| **Hallucination vs injection** | A hallucinating model is wrong. An injected model is being steered. Both can lead to bad actions; only one has an attacker behind it. |
| **AI safety vs AI security** | Safety is about the system causing harm by itself: bad advice, dangerous behaviour. Security is about someone attacking or misusing it. Agents need both. |
| **Chatbot vs copilot vs agent vs workflow automation** | A chatbot answers. A copilot suggests while you decide. An agent acts. A workflow automation (scripts, traditional RPA) follows fixed steps; an agent chooses its own. |
| **Model vs app vs platform** | Names such as Gemini, Claude and Grok each cover a model, an app and a platform. Security controls belong to a specific product and plan, not to the brand. |
| **Training vs inference** | Training builds the model; inference uses it. "Not used for training" doesn't mean "not stored". |
| **RAG vs fine-tuning** | RAG looks up your documents each time and keeps them separate from the model. Fine-tuning builds data into the model, where it is hard to remove or to limit by permission. |
| **Context window vs memory vs training data** | Context is what the model sees right now. Memory is what the agent saved between sessions. Training data is what the model learned from before release. |
| **MCP vs API vs A2A** | An API is any software interface. MCP is a standard way for agents to use tools and data, usually through APIs. A2A is for agents handing work to other agents. |
| **Acting as the user vs acting as itself** | An agent using your sign-in has all your access and appears in logs as you. An agent with its own identity can be scoped, tracked and switched off on its own. |
| **Evals vs red teaming vs penetration test** | Evals measure behaviour against a test set. Red teaming hunts for ways to make the AI misbehave. A penetration test looks for weaknesses in the systems around it. You need all three. |
| **Vibe coding vs AI-assisted development** | Vibe coding means accepting AI-written code without reading it. AI-assisted development means a developer uses AI but still reviews, tests and owns the code. The tools are the same; the discipline isn't. |
| **Open weights vs open source** | Open weights means you can download and run the model. Open source, in the full sense, would also publish the training code and data, which is rare. |
| **Guardrails vs alignment** | Guardrails are controls added around a model. Alignment is the work of making the model itself behave well. Neither is a guarantee. |

## Common misconceptions

1. **"The system prompt tells it not to, so it won't."** Prompts are guidance. Enforce limits in code, permissions and gateways.
2. **"Prompt injection is a bug the vendor will patch."** It follows from how LLMs read text: instructions and data share one stream ([Willison](#src-willison-trifecta)). Vendors can reduce it, not remove it, so design for it happening.
3. **"Human-in-the-loop makes it safe."** Only if people see the right detail and aren't approving dozens of requests a day ([Anthropic](#src-duet)).
4. **"An enterprise plan means secure by default."** Some products keep key controls, such as audit logs, for their top tier ([Cursor](#src-grokbot)). Check what your plan includes and what is switched on.
5. **"They don't train on our data, so our data isn't stored."** Training and retention are separate promises. Ask about both.
6. **"It can only read, so it can't leak anything."** Links, images and messages it writes can carry data out, as EchoLeak showed ([Hack The Box](#src-echoleak)).
7. **"A private or self-hosted model can't be prompt-injected."** Injection comes from the content the model reads, wherever the model runs.
8. **"The chat history shows everything the agent did."** Activity between conversations may not appear there ([eWeek](#src-newcore)). Keep your own logs.
9. **"MCP is a security standard."** It is a connection standard. How secure a server is depends on how it is built and configured.
10. **"A classifier will catch the attacks."** Classifiers are probabilistic, and attackers test against them. Use them as one layer.
11. **"Agents only act when asked."** Some personal agents now watch connected apps and start tasks before the user asks ([Crypto Briefing](#src-duet-proactive)).
12. **"Banning AI tools removes the risk."** It tends to move use to personal accounts, where you have no controls or logs.
13. **"AI coding tools write secure code by default."** In Veracode's October 2026 tests, about four in 10 tasks still produced vulnerable code without security-specific prompting, and results varied widely by model ([Veracode](#src-veracode)). Review and scan AI-written code like any other.

## Vendor-speak decoder

| They say | Ask |
| --- | --- |
| "Enterprise-grade guardrails" | Which ones, enforced where, and which plan includes them? |
| "Secure by design" | What happens when the model is fooled? |
| "Human in the loop" | How many approvals a day will a typical user see? |
| "Your data stays yours" | What is the retention period, is it used for training, and who at the vendor can see it? |
| "Agents act with your permissions" | So a compromised agent has all of them? |

## Frameworks

The main standards, frameworks and catalogues for AI security, by what they're for. Status as of November 2026.

**Vocabulary**

- **ISO/IEC 22989:2022**, AI concepts and terminology. The shared vocabulary most ISO AI standards build on.
- **NIST AI 100-2 E2025**, Adversarial Machine Learning: A Taxonomy and Terminology of Attacks and Mitigations. The main reference for attack names.

**Risk management and governance**

- **NIST AI Risk Management Framework (AI RMF 1.0)** and its **Generative AI Profile (NIST AI 600-1)**. Voluntary; widely used in the US.
- **ISO/IEC 42001**, AI management systems. Certifiable, so it often turns up in audits and procurement.
- **ISO/IEC 23894**, guidance on AI risk management.
- **EU AI Act**. Law rather than a standard; its definitions bind anyone placing AI systems on the EU market.

**Security baselines and controls**

- **ETSI EN 304 223**, Baseline Cyber Security Requirements for AI Models and Systems (December 2025). Thirteen principles across five lifecycle phases. The UK's **AI Cyber Security Code of Practice** mirrors it ([gov.uk](#src-uk-mapping)).
- **NCSC and CISA Guidelines for Secure AI System Development** (2023), which the UK code and the ETSI standard build on.
- **CSA AI Controls Matrix (AICM)**. v1.0 had 243 control objectives across 18 domains, mapped to ISO 42001, ISO 27001, the NIST AI RMF and the EU AI Act ([CSA](#src-csa-aicm)); v1.1 followed in June 2026.

**Threat catalogues**

- **MITRE ATLAS**. Attack tactics and techniques against AI systems in the style of MITRE ATT&CK, with case studies.
- **OWASP Top 10 for LLM Applications 2026** and **OWASP Top 10 for Agentic Applications**.
- **CSA MAESTRO**, a threat-modelling method for agentic AI ([CSA](#src-csa-gap)).

**Agent-specific work in progress**

- **NIST CAISI AI Agent Standards Initiative**, launched February 2026, with research on agent hijacking ([CSA](#src-csa-caisi)).
- **NCCoE concept paper on AI agent identity** ([CSA](#src-csa-gap)).

## Sources

Checked on 27 November 2026.

1. <span id="src-owasp-llm"></span>OWASP GenAI Security Project, [OWASP GenAI LLM Top 10 2026](https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/), published 4 August 2026 ([list on GitHub](https://github.com/GenAI-Security-Project/GenAI-LLM-Top10)). Entry IDs LLM01 to LLM10 on this page are the 2026 numbers.
2. <span id="src-owasp-agentic"></span>OWASP GenAI Security Project, [OWASP Top 10 for Agentic Applications for 2026](https://genai.owasp.org/2025/12/09/owasp-top-10-for-agentic-applications-the-benchmark-for-agentic-security-in-the-age-of-autonomous-ai/), 9 December 2025. Entry IDs ASI01 to ASI10.
3. <span id="src-nist-aml"></span>NIST, [AI 100-2 E2025, Adversarial Machine Learning: A Taxonomy and Terminology of Attacks and Mitigations](https://csrc.nist.gov/pubs/ai/100/2/e2025/final), March 2025. Direct and indirect prompt injection.
4. <span id="src-willison-trifecta"></span>Simon Willison, [The lethal trifecta for AI agents: private data, untrusted content, and external communication](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/), 16 June 2025.
5. <span id="src-aaif"></span>Linux Foundation, [Linux Foundation announces the formation of the Agentic AI Foundation](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation), 9 December 2025.
6. <span id="src-a2a"></span>Linux Foundation, [Linux Foundation launches the Agent2Agent Protocol project](https://linuxfoundation.org/press/linux-foundation-launches-the-agent2agent-protocol-project-to-enable-secure-intelligent-communication-between-ai-agents), 23 June 2025.
7. <span id="src-echoleak"></span>Hack The Box, [Inside CVE-2025-32711 (EchoLeak): prompt injection meets AI exfiltration](https://www.hackthebox.com/blog/cve-2025-32711-echoleak-copilot-vulnerability), 24 July 2025. Original research by Aim Labs (Aim Security).
8. <span id="src-slopsquatting"></span>CSO Online, [AI hallucinations lead to a new cyber threat: slopsquatting](https://www.csoonline.com/article/3961304/ai-hallucinations-lead-to-a-new-cyber-threat-slopsquatting.html), reporting a study of 16 code-generation models.
9. <span id="src-duet"></span>Anthropic, [Claude Duet safety, privacy, and security](https://claude.com/blog/claude-duet-safety-privacy-and-security), October 2026. Approval fatigue.
10. <span id="src-duet-proactive"></span>Crypto Briefing, [Anthropic's Claude Duet AI agent](https://cryptobriefing.com/anthropic-claude-duet-ai-agent/), October 2026. An agent that starts work before the user opens a chat.
11. <span id="src-newcore"></span>eWeek, [Grok Bots tried to access work apps 31 times without approval](https://www.eweek.com/news/grok-bots-unapproved-work-app-requests/), 2026.
12. <span id="src-grokbot"></span>Cursor, [Grok Bot security](https://cursor.com/docs/grok-bot/security), November 2026. Audit logs available on the Enterprise plan only.
13. <span id="src-owasp-llm01"></span>OWASP GenAI Security Project, [LLM01:2025 Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/). Jailbreaking as a form of prompt injection.
14. <span id="src-csa-owasp2026"></span>Cloud Security Alliance, [OWASP's 2026 LLM Top 10 and new Agent Control Standard](https://labs.cloudsecurityalliance.org/research/csa-research-note-owasp-genai-top10-2026-agent-control-stand/), 4 September 2026. System Prompt Leakage replaced by Hidden Context Exposure.
15. <span id="src-nist-600-1"></span>NIST, [AI 600-1, Artificial Intelligence Risk Management Framework: Generative Artificial Intelligence Profile](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf), July 2024. Confabulation.
16. <span id="src-caisi"></span>NIST CAISI, [Technical blog: strengthening AI agent hijacking evaluations](https://www.nist.gov/news-events/news/2025/01/technical-blog-strengthening-ai-agent-hijacking-evaluations), January 2025.
17. <span id="src-atlas"></span>MITRE, ATLAS technique [AML.T0051 LLM Prompt Injection](https://d3fend.mitre.org/offensive-technique/attack/AML.T0051/) (as mirrored in MITRE D3FEND), with sub-techniques; AML.T0053 and AML.T0054 from the ATLAS matrix, release v2026.10.
18. <span id="src-iso-22989"></span>ISO/IEC 22989:2022, Artificial intelligence concepts and terminology. Definitions as adopted in the Australian Government's [Guidance for AI adoption: terms and definitions](https://www.industry.gov.au/publications/guidance-for-ai-adoption/terms-and-definitions).
19. <span id="src-eu-ai-act"></span>EU AI Act, Regulation (EU) 2024/1689, [Article 3: Definitions](https://artificialintelligenceact.eu/article/3/).
20. <span id="src-etsi"></span>ETSI, [EN 304 223 V2.1.1, Securing Artificial Intelligence (SAI); Baseline Cyber Security Requirements for AI Models and Systems](https://www.etsi.org/deliver/etsi_en/304200_304299/304223/02.01.01_60/en_304223v020101p.pdf), December 2025; scope summarised by [techUK](https://www.techuk.org/insights/news/etsi-sets-out-new-european-standard-to-strengthen-ai-cyber-security).
21. <span id="src-uk-mapping"></span>UK Government, [Mapping global AI security standards, regulations and guidance](https://www.gov.uk/government/publications/mapping-global-ai-security-standards-regulations-and-guidance). The AI Cyber Security Code of Practice mirrors EN 304 223.
22. <span id="src-csa-aicm"></span>Cloud Security Alliance, [AI Controls Matrix v1.1](https://cloudsecurityalliance.org/artifacts/ai-controls-matrix-v1-1), released June 2026; v1.0 structure from CSA's [agentic gap analysis](https://labs.cloudsecurityalliance.org/agentic/agentic-aicm-supplement-gap-analysis-v1/).
23. <span id="src-csa-caisi"></span>Cloud Security Alliance, [CAISI's AI agent security agenda](https://labs.cloudsecurityalliance.org/research/csa-research-note-nist-caisi-ai-agent-security-agenda-2026-2/), 14 April 2026.
24. <span id="src-csa-gap"></span>Cloud Security Alliance, [The AI agent governance gap: what CISOs need now](https://labs.cloudsecurityalliance.org/research/csa-research-note-ai-agent-governance-framework-gap-20260403/), April 2026.
25. <span id="src-vibe-collins"></span>The Register, ['Vibe coding' named Word of the Year. Developers everywhere faceplant](https://www.theregister.com/2025/11/06/vibe_coding_escape_the_clutches/), 6 November 2025.
26. <span id="src-willison-vibe"></span>Simon Willison, [Not all AI-assisted programming is vibe coding (but vibe coding rocks)](https://simonwillison.net/2025/Mar/19/vibe-coding/), 19 March 2025; and [Vibe engineering](https://simonwillison.net/2025/Oct/7/vibe-engineering/), 7 October 2025.
27. <span id="src-veracode"></span>Veracode, [First meaningful gain in AI code security since 2025 as average pass rate hits 62%](https://veracode.com/press-release/veracode-finds-first-meaningful-gain-in-ai-code-security-since-2025-as-average-pass-rate-hits-62), 29 October 2026.
28. <span id="src-replit"></span>Fortune, [AI coding tool Replit wiped a database and called it a catastrophic failure](https://fortune.com/2025/07/23/ai-coding-tool-replit-wiped-database-called-it-a-catastrophic-failure/), 23 July 2025.
29. <span id="src-replit-heise"></span>heise online, [Vibe coding service Replit deletes production database](https://heise.de/-10499597), July 2025.
30. <span id="src-pillar"></span>Pillar Security, [New vulnerability in GitHub Copilot and Cursor: how hackers can weaponize code agents](https://pillar.security/blog/new-vulnerability-in-github-copilot-and-cursor-how-hackers-can-weaponize-code-agents), 18 March 2025.
31. <span id="src-invariant"></span>Invariant Labs, [GitHub MCP exploited: accessing private repositories via MCP](https://invariantlabs.ai/blog/mcp-github-vulnerability), 26 May 2025.
32. <span id="src-promptpwnd"></span>Aikido Security, [PromptPwnd: prompt injection vulnerabilities in GitHub Actions using AI agents](https://aikido.dev/blog/promptpwnd-github-actions-ai-agents), December 2025.
33. <span id="src-gitlost"></span>The Hacker News, [Public GitHub issue could trick GitHub Agentic Workflows into leaking private repositories](https://thehackernews.com/2026/07/public-github-issue-could-trick-github.html), July 2026 (Noma Security's GitLost research).
34. <span id="src-pickleball"></span>Kellas et al., [PickleBall: secure deserialization of pickle-based machine learning models](https://arxiv.org/abs/2508.15987), ACM CCS 2025.

## Changes

- **27 November 2026:** added "Building software with AI" (vibe coding, AI-assisted development, coding agents, auto-approve, rules files, slopsquatting, toxic agent flows, AI in CI/CD, model files), with a matching confused pair and misconception.
- **27 November 2026:** added "Same idea, different names", Frameworks, and an entry on roles; moved OWASP LLM IDs to the 2026 edition; noted NIST's "confabulation" and "agent hijacking" and how OWASP and ATLAS file jailbreaks.
- **27 November 2026:** first version: 36 terms, 13 commonly confused pairs, 12 misconceptions and the vendor-speak decoder.

*Text CC BY 4.0. Café Security Research.*
