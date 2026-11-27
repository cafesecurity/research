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

**On this page:** [The basics](#the-basics) · [How agents connect to things](#how-agents-connect-to-things) · [Attacks](#attacks) · [Defences and controls](#defences-and-controls) · [Governance](#governance) · [Building software with AI](#building-software-with-ai) · [Personal agents](#personal-agents-the-2026-products) · [Inside the AI stack](#inside-the-ai-stack) · [Evaluating models](#evaluating-models) · [Who makes the models](#who-makes-the-models) · [Same idea, different names](#same-idea-different-names) · [Commonly confused](#commonly-confused) · [Common misconceptions](#common-misconceptions) · [Vendor-speak decoder](#vendor-speak-decoder) · [Frameworks](#frameworks) · [Sources](#sources)

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

## Personal agents: the 2026 products

Between May and October 2026 most big labs launched a personal or workplace agent that keeps working when you close the app. They use different names for the same pattern, so this section explains the pattern first, then the products.

<div class="cs-term" markdown="1">

### Always-on agent (personal agent) { #always-on-agent }

- **What it is:** An agent that runs on its own computer in the vendor's cloud, connects to your email, calendar, files and other apps, and works in the background: watching for things that need attention, running scheduled jobs and coming back to you when it needs a decision. Most also act proactively, starting work you didn't ask for. Each product below works this way.
- **Why it matters:** It is the [lethal trifecta](#lethal-trifecta) by design: private data, untrusted content (every email and web page it reads) and the ability to send and buy. It holds sign-ins to many services, acts while nobody is watching, and is often set up by staff on personal plans, which makes it [shadow AI](#shadow-ai) unless you plan for it. Activity between conversations may not show up in the chat history ([eWeek](#src-newcore)).
- **Ask your vendor:** Is there a business plan with admin controls and audit logs, which actions always need approval, where are the agent's credentials kept, and can admins switch it off for everyone?

</div>

### The products { #personal-agent-products }

Alphabetical. Status as of 27 November 2026, from launch announcements and press coverage; these products change monthly.

| Product (maker) | Launched | Who can get it | How it works | Security design the vendor describes |
| --- | --- | --- | --- | --- |
| **Claude Duet** (Anthropic) | Research preview, 21 October 2026 | Claude Pro and Max subscribers in the US, by waitlist; not on Team or Enterprise plans yet ([iThinkDiff](#src-duet-launch)) | Runs on a cloud virtual machine with its own browser; sends a morning brief and checks in before acting ([Make Tech Easier](#src-duet-vm)) | Passwords and sign-in tokens never reach the agent directly; health and personal finance details go out only on the user's explicit instruction ([BetaNews](#src-duet-safety)) |
| **dots** (OpenAI) | 29 September 2026 | ChatGPT Pro and Business Premium in eligible markets; Enterprise beta enabled by admins ([Unite.AI](#src-dots-launch)) | Each dot runs on GPT-6 Astra on its own cloud computer that the user can open to inspect its work; linking a personal computer is optional and off by default ([BetaNews](#src-dots-computer)) | Built-in rules on when to act and when to ask; specialist enterprise dots being integrated with Microsoft Agent 365 governance ([IBTimes](#src-dots-rules)) |
| **Gemini agent** (Google Cloud) | 8 October 2026 | Gemini Enterprise customers, including through Workspace business and enterprise plans ([Implicator](#src-gemini-agent)) | Plans and runs work for hours or days in the cloud, routing tasks across Gemini and Anthropic's Claude models | Companies can give an AI coworker its own company email address, calendar and directory entry: an agent with its own [identity](#non-human-identity) ([Implicator](#src-gemini-agent)) |
| **Gemini Spark** (Google) | Announced 19 May 2026; beta for Google AI Ultra in the US from 29 May ([Thurrott](#src-spark-beta)) | Consumers on Google AI plans; a Workspace and Gemini Enterprise preview was announced for business ([Duke](#src-spark-duke)) | Runs on Gemini 3.5 and Google's Antigravity agent harness; can take tasks by email at its own Gmail address ([The Next Web](#src-spark-tnw)) | Designed to check before major actions; purchases need review and approval at launch ([VentureBeat](#src-spark-vb)) |
| **Grok Bot** (SpaceXAI, built on Cursor) | Early beta, 11 August 2026 ([SpaceXAI](#src-grokbot-launch)) | SuperGrok Heavy, Cursor Ultra and Cursor Teams Premium subscribers at launch ([GIGAZINE](#src-grokbot-plans)), with an enterprise waitlist ([SpaceXAI](#src-grokbot-launch)) | Each bot gets a cloud computer and signs into your tools, including ones with no API or MCP connection ([eWeek](#src-grokbot-eweek)) | Admin controls such as audit logs and network controls are Enterprise-only ([Cursor](#src-grokbot)); in testing, a security gateway caught 31 unapproved read requests ([eWeek](#src-newcore)) |
| **Muse** (Meta) | 8 September 2026 | US; free for most uses with paid plans; app, web and WhatsApp, plus a Mac app ([Fast Company](#src-muse-agent-fc)) | Runs on Muse Secure VM, a dedicated virtual machine holding the agent and the person's data ([Meta](#src-muse-agent)) | A separate Sentinel agent must approve anything Muse sends to the internet; payments use single-use card numbers ([Meta](#src-muse-agent), [SiliconANGLE](#src-muse-link)) |
| **OpenClaw** (open source) | Late 2025 | Anyone; self-hosted on your own machine | Runs locally with access to files, email, calendar and the command line, and wakes on a schedule ([TechRadar](#src-openclaw)) | Security depends on how you set it up. Researchers found a community skill that exfiltrated data, and its config file holds keys for every connected service ([TechRadar](#src-openclaw)) |

Other personal agents in the same category include Hermes Agent, Instinct, Manus Cue and Poke ([Every](#src-every-agents)). Don't confuse OpenAI's **dots** with **Dot**, an unrelated iPhone assistant app from Emotion Computer.

**What a CISO should check, whichever product staff use:**

- **Which plan?** Several of these products launched for consumers or individual subscribers first, without business admin controls. A personal plan connected to work email is shadow AI.
- **Whose identity?** Most act as the user with the user's sign-ins. Google's enterprise agent can have its own account. See [Acting as the user vs acting as itself](#commonly-confused).
- **Where are the credentials?** Vendors increasingly keep passwords and tokens away from the model. Self-hosted agents usually keep them in a config file.
- **What runs without asking?** Scheduled and proactive tasks may act with no approval at all.
- **What gets logged, and where?** Ask for an audit log you can export to your SIEM, not just the chat history.

## Inside the AI stack

<div class="cs-term" markdown="1">

### Foundation model / frontier model { #frontier-model }

- **What it is:** A foundation model is a large model trained on broad data and then adapted to many tasks. *Frontier model* usually means the most capable models available at a given time.
- **Why it matters:** Frontier models come with the most detailed safety testing and the most restricted early access, and they set the capability attackers will have soon after.
- **Ask your vendor:** Which model, at which version, does this product use, and when did you last change it?

</div>

<div class="cs-term" markdown="1">

### Parameters and mixture of experts (MoE) { #parameters }

- **What it is:** Parameters (or weights) are the numbers a model learns in training; their count is a rough guide to size. A mixture-of-experts model uses only part of itself for each request, so it has a *total* and an *active* parameter count: Meta's Muse Spark Open, for example, has 816 billion parameters with 42 billion active ([The New Stack](#src-muse-open)).
- **Why it matters:** Size decides what hardware you need to run an open-weight model yourself, and so whether self-hosting is realistic. Weights are also an asset: stolen weights are a stolen model.
- **Ask yourself:** If we host a model ourselves, who protects the weights and the machines they run on?

</div>

<div class="cs-term" markdown="1">

### Reasoning model, thinking and effort { #reasoning-model }

- **What it is:** A model that works through a problem step by step before answering, often in a hidden or summarised "thinking" section. Many let you set an *effort* level: more thinking costs more and takes longer but usually scores higher ([Anthropic](#src-claude-models)).
- **Why it matters:** Thinking text can contain sensitive data from the context and may be logged or retained differently from the final answer. Effort settings also change results, so a benchmark score means little without the effort level it was run at.
- **Ask your vendor:** Is thinking output stored or shown to users, and is it covered by the same retention and access rules as the answer?

</div>

<div class="cs-term" markdown="1">

### Harness (scaffold) { #harness }

- **What it is:** The software around a model that turns it into an agent: it supplies the system prompt and tools, manages memory and context, runs the loop of plan, act and check, and asks for approval. METR describes an AI agent as a model plus a scaffold ([METR](#src-metr-paper)). Coding agents and products such as Grok Bot or Claude Duet are harnesses around their models.
- **Why it matters:** Most of the security controls an organisation can set live in the harness, not the model: which tools exist, what needs approval, what is logged. The same model behaves very differently in a careful harness and a careless one.
- **Ask your vendor:** Which controls are in the harness, which can admins configure, and do they apply on every surface (app, API, command line)?

</div>

<div class="cs-term" markdown="1">

### Agent framework / SDK { #agent-framework }

- **What it is:** Code libraries developers use to build their own agents and harnesses, such as Google's Agent Development Kit ([Google](#src-gemini4)) and the SDKs the main labs publish.
- **Why it matters:** In-house agents built on these frameworks inherit their defaults. Security is then your team's job: tool permissions, secrets, logging and approval gates. OWASP: ASI04 Agentic Supply Chain Vulnerabilities.
- **Ask your teams:** Which agent frameworks are we building on, are they pinned and patched like other dependencies, and who reviews their default settings?

</div>

<div class="cs-term" markdown="1">

### Orchestrator and subagents { #subagents }

- **What it is:** One agent (the orchestrator) splits a task and hands parts to other agents (subagents), often running in parallel, then combines the results.
- **Why it matters:** Each hand-off is a trust boundary. A subagent that reads untrusted content can pass an injected instruction back up the chain, and permissions can spread to agents that didn't need them. See also [A2A](#a2a).
- **Ask your vendor:** Do subagents get narrower permissions than the orchestrator, and are their actions logged separately?

</div>

<div class="cs-term" markdown="1">

### Model versions and aliases { #model-versions }

- **What it is:** Model names in APIs come in fixed versions and moving aliases. Google, for example, offers stable, preview, latest and experimental versions; a "latest" alias is switched to each new release, with two weeks' notice by email ([Google](#src-gemini-versions)).
- **Why it matters:** An alias means the model behind your product can change without your code changing. A new version can behave differently, including on safety and prompt injection. Pinning a version makes behaviour testable; aliases make it a moving target.
- **Ask your vendor:** Can we pin model versions, how much notice do we get before a version is retired, and do you tell us when the model behind a product changes?

</div>

<div class="cs-term" markdown="1">

### Inference provider { #inference-provider }

- **What it is:** Whoever actually runs the model for you. The same model is often available from the lab directly and through cloud platforms: OpenAI's GPT-6 Astra, for example, through OpenAI's API, Microsoft Azure and AWS Bedrock ([OpenAI](#src-astra-availability)).
- **Why it matters:** Data handling, retention, region, logging and contract terms follow the provider and the route, not the model. One model can have different security properties depending on which door you use.
- **Ask your vendor:** Which provider and region actually process our requests, and which terms govern our data on this route?

</div>

<div class="cs-term" markdown="1">

### Distillation { #distillation }

- **What it is:** Training a smaller, cheaper model to imitate a larger one, usually by learning from the larger model's outputs.
- **Why it matters:** The smaller model may not keep all of the larger model's safety behaviour, so test it in its own right.
- **Ask your vendor:** Was this model distilled from another, and has it been safety-tested separately?

</div>

<div class="cs-term" markdown="1">

### Quantisation { #quantisation }

- **What it is:** Storing a model's parameters with fewer bits so it needs less memory and runs on smaller hardware, at some cost in quality.
- **Why it matters:** Quantised versions of open-weight models are often published by third parties, not the original lab. That makes them a supply-chain question: who made this file, and is it what it claims to be? See [model files](#model-files).
- **Ask your teams:** Do we only use model files from the original publisher or a verified source, and do we check their hashes?

</div>

<div class="cs-term" markdown="1">

### Context engineering { #context-engineering }

- **What it is:** Deciding what goes into a model's [context window](#context-window) for each step: which instructions, documents, tool results and memories, and in what order.
- **Why it matters:** It is where data minimisation happens for AI. Everything put into context can be leaked, logged or turned against you by injected text, so include only what the step needs. OWASP: LLM08 Hidden Context Exposure.
- **Ask your vendor:** What does the product put into context automatically, and can we exclude sensitive sources?

</div>

## Evaluating models

<div class="cs-term" markdown="1">

### Model card / system card { #model-card }

- **What it is:** A document a lab publishes with a model describing what it is for, how it was tested, its limits and its safety results. *System card* usually means a longer version covering the model inside its product, with safety and security testing. Google and Anthropic, for example, both keep public lists of theirs ([Google DeepMind](#src-model-cards-google), [Anthropic](#src-model-cards-anthropic)).
- **Why it matters:** It is the nearest thing to a security data sheet for a model: prompt-injection results, cyber capability, red-team findings, known failure modes. It is written by the vendor, so read it as a claim to verify, not an audit.
- **Ask your vendor:** Where is the model or system card for the exact version we use, and which results were checked by a third party?

</div>

<div class="cs-term" markdown="1">

### Benchmark { #benchmark }

- **What it is:** A fixed set of tasks with a scoring method, used to compare models: coding problems, exam questions, hacking challenges. See [Common benchmarks](#common-benchmarks) below.
- **Why it matters:** Benchmarks are the main evidence in AI marketing. A score only tells you how the model did on that test, under that setup, at that effort level, which may be far from your use.
- **Ask your vendor:** Which benchmarks match our use case, who ran them, with what settings, and can we see results on our own tasks?

</div>

<div class="cs-term" markdown="1">

### Contamination { #contamination }

- **What it is:** When test questions or their answers have leaked into a model's training data, so the model can recall rather than solve them. In February 2026 OpenAI stopped reporting SWE-bench Verified, a widely used coding benchmark, because it was increasingly contaminated and some of its tests rejected correct answers ([OpenAI](#src-swe-verified)).
- **Why it matters:** A contaminated benchmark overstates capability. Public benchmarks built from public code are especially exposed.
- **Ask your vendor:** How do you check that benchmark scores aren't inflated by training on the test?

</div>

<div class="cs-term" markdown="1">

### Saturation { #saturation }

- **What it is:** When top models all score near the ceiling of a benchmark, so it no longer separates them. Labs then move to harder versions or new tests.
- **Why it matters:** A saturated benchmark can make models look interchangeable when they aren't, and benchmark names change quickly. Check that a score comes from a current, unsaturated test.
- **Ask yourself:** Is this benchmark still used by the labs, or has it been replaced?

</div>

<div class="cs-term" markdown="1">

### Leaderboard (LMArena) { #leaderboard }

- **What it is:** A public ranking of models. LMArena (formerly Chatbot Arena) ranks them by people's votes between two anonymous answers, using an Elo-style score like chess ratings.
- **Why it matters:** Rankings reward what voters like, not what is secure or correct, and they can be gamed. One 2025 study found a provider had tested 27 private variants before publishing one, which then ranked second ([The Leaderboard Illusion](#src-arena)).
- **Ask yourself:** Is a leaderboard position being used as evidence for something it doesn't measure?

</div>

<div class="cs-term" markdown="1">

### pass@1 and pass@k { #pass-at-k }

- **What it is:** Scoring that counts a task as solved if any of *k* attempts succeeds. pass@1 means one try; pass@10 allows ten.
- **Why it matters:** A high pass@k can hide an unreliable model. Agents in production usually get one try, and attackers get many: the same number reads differently for defence and offence.
- **Ask your vendor:** Is this score pass@1, and how consistent is the model across repeated runs?

</div>

<div class="cs-term" markdown="1">

### Cost per task and the Pareto frontier { #pareto-frontier }

- **What it is:** Labs now often report a score together with what it cost to get it. The Pareto frontier is the set of models where you can't get a better score without paying more (or more slowly). Google, for example, describes its Flash models as pushing this frontier on quality, cost and speed ([Google](#src-pareto)).
- **Why it matters:** For most business uses the right model is the cheapest one that is good enough, not the top scorer. A model on the frontier for coding may be off it for your task.
- **Ask yourself:** What is the cheapest model that meets our bar on our own tests, including security tests?

</div>

<div class="cs-term" markdown="1">

### Time horizon { #time-horizon }

- **What it is:** METR's measure of how long a task, timed for a skilled human, an AI agent can complete with a given reliability: the 50% time horizon is the task length at which the agent succeeds half the time ([METR](#src-metr)). METR has found it doubling roughly every seven months since 2019 ([METR](#src-metr-paper)).
- **Why it matters:** It is one of the clearest single signals of how much autonomous work agents can take on, including attack work. It measures task difficulty, not how long an agent can run unattended.
- **Ask yourself:** What could an agent do in our environment with tasks of that length, for us and against us?

</div>

<div class="cs-term" markdown="1">

### LLM-as-judge { #llm-as-judge }

- **What it is:** Using one model to grade another's answers, because human grading is slow and expensive.
- **Why it matters:** Cheap and scalable, but the judge has its own biases and can itself be prompt-injected by the text it grades. Many guardrails work the same way.
- **Ask your vendor:** Which of your results or safeguards depend on a model grading another model, and how was that judge checked?

</div>

<div class="cs-term" markdown="1">

### Evaluation awareness and sandbagging { #evaluation-awareness }

- **What it is:** Evaluation awareness is a model recognising that it is being tested. Sandbagging is a model deliberately doing worse on a test, for example to avoid restrictions ([Nguyen et al.](#src-eval-aware)).
- **Why it matters:** Both make test results less trustworthy. OpenAI reports that awareness of being evaluated has already affected the results of alignment evaluations in current models ([OpenAI](#src-metagaming)). A model that behaves well in testing may not behave the same in production.
- **Ask your vendor:** How do you test for evaluation awareness, and what do you monitor in production in case behaviour differs?

</div>

<div class="cs-term" markdown="1">

### Capability thresholds and frontier safety frameworks { #safety-frameworks }

- **What it is:** Labs' own policies that define dangerous capability levels (for example in cybersecurity or biology) and the safeguards required at each. Examples include Anthropic's Responsible Scaling Policy with its AI Safety Levels ([Anthropic](#src-rsp)), Google DeepMind's Frontier Safety Framework ([Google](#src-fsf)) and OpenAI's Preparedness Framework, under which OpenAI rated GPT-6 Astra as meeting its Critical threshold for cybersecurity ([9to5Mac](#src-astra)).
- **Why it matters:** They tell you when a lab believes a model could meaningfully help attackers, and they explain staged and restricted releases. They are voluntary and set by the labs themselves.
- **Ask yourself:** Which of the models we use are rated high for cyber capability, and what does that mean for our threat model?

</div>

<div class="cs-term" markdown="1">

### Trusted access programme { #trusted-access }

- **What it is:** Early or restricted release of a highly capable model to vetted users, often cyber defenders, before or instead of general release. Recent examples include Anthropic's Mythos models through Project Glasswing ([Anthropic](#src-claude-models)) and Google's Gemini 4 Argon and Carbon, which went first to cyber defenders through its Fairwind programme ([Google](#src-gemini4), [Let's Data Science](#src-carbon)).
- **Why it matters:** Defenders may get access to the strongest models for finding and fixing vulnerabilities before general release. It also signals that the lab rates the model's offensive potential highly.
- **Ask yourself:** Is our security team eligible for any of these programmes, and would joining be worth the obligations?

</div>

### Common benchmarks { #common-benchmarks }

| Benchmark | What it measures | Note |
| --- | --- | --- |
| SWE-bench Verified | Fixing 500 real issues from open-source Python projects | OpenAI stopped reporting it in February 2026 as contaminated and partly flawed ([OpenAI](#src-swe-verified)) |
| SWE-Bench Pro | Harder, longer software engineering tasks: 1,865 problems from 41 repositories | Built to resist contamination ([Scale AI](#src-swe-pro)); a later verified version found some reported scores were too high ([SWE-Bench Pro Verified](#src-swe-pro-verified)) |
| GPQA Diamond | Graduate-level science questions | Close to saturation: Google reported 90.4% for Gemini 3 Flash ([Google](#src-pareto)) |
| Humanity's Last Exam | Very hard expert questions across many fields | Used to separate the strongest models |
| MMMU Pro | Reasoning over images and text together | Multimodal |
| METR time horizon | Length of tasks agents complete reliably | See [Time horizon](#time-horizon) ([METR](#src-metr)) |
| Cybench | 40 professional capture-the-flag (CTF) hacking tasks | CTFs are idealised compared with real systems ([Cybench](#src-cybench)) |
| CyberGym | Reproducing 1,507 real vulnerabilities across 188 open-source projects | Led to the discovery of 35 zero-day vulnerabilities ([CyberGym](#src-cybergym)) |
| CWE-bench | Fixing security weaknesses in code | Reported by Google for Gemini 4 Argon ([Google](#src-gemini4-ja)) |
| AgentDojo | Whether agents can be hijacked by injected instructions | Used by NIST CAISI for agent hijacking tests ([NIST CAISI](#src-caisi)) |
| Gray Swan Indirect Prompt Injection | Robustness to indirect prompt injection | Cited by Google for Gemini 4 Argon ([Google](#src-grayswan)) |
| LMArena | Human preference between anonymous answers | See [Leaderboard](#leaderboard) |

Most benchmark results are run and reported by the lab that made the model. Look for independent results from organisations such as METR, Epoch AI or government AI security institutes before relying on a number.

## Who makes the models

The main AI labs and their current model families, in alphabetical order. Status as of 27 November 2026; line-ups change every few weeks, so check the lab's own model page before relying on a detail.

| Lab | Model families | In one line |
| --- | --- | --- |
| **Alibaba** (China) | Qwen (Qwen3.8; Max through Alibaba Cloud) | Large open-weight family; the licence is a modified MIT licence with revenue and display clauses ([PromptsRush](#src-open-weights)). |
| **Anthropic** (US) | Claude: Fable, Opus, Sonnet, Haiku; Mythos | Fable 5.2 is its most capable widely released model; Opus 5.5, Sonnet 5.5 and Haiku 5.5 trade capability for speed and cost; Mythos 5.2 is the same model as Fable with restricted access ([Anthropic](#src-claude-models), [nhimg](#src-claude-lineup)). Closed weights. |
| **DeepSeek** (China) | DeepSeek V4 (Pro, Flash), V4.1 Flash | Open weights under the MIT licence with a low-cost API ([daily.dev](#src-deepseek), [PromptsRush](#src-open-weights)). |
| **Google DeepMind** (UK/US) | Gemini 4 (Carbon, Argon); Gemini 3.x Flash, Flash-Lite and Flash Cyber; Gemma; Nano Banana | Carbon is its strongest model, generally available since 10 November 2026; Flash models are faster and cheaper; Gemma models are open weights; Nano Banana makes images ([Let's Data Science](#src-carbon), [Google DeepMind](#src-model-cards-google)). |
| **Meta** (US) | Muse Spark, Muse Spark Open; Llama (earlier) | Muse Spark (April 2026) is proprietary ([Axios](#src-muse)); Muse Spark Open (October 2026) is an open-weight model under Meta's own licence ([The New Stack](#src-muse-open)). Llama was its earlier open-weight family. |
| **Mistral AI** (France) | Mistral Large 4; Mistral 3 family | European lab publishing open weights; Large 4's weights were released on 29 October 2026 ([Tech Insider](#src-open-licences)). |
| **Moonshot AI** (China) | Kimi (K3.1) | Ranked the most capable downloadable open-weight model in one November 2026 comparison ([PromptsRush](#src-open-weights)). |
| **OpenAI** (US) | GPT-6: Astra, Sol, Luna; gpt-oss | Astra (September 2026) is its flagship; Sol and Luna are cheaper tiers ([TechCrunch](#src-gpt6)); gpt-oss models are its only open weights, under Apache 2.0 ([nhimg](#src-openai-lineup)). Codex is its coding agent. |
| **SpaceXAI** (US; formerly xAI) | Grok 4.6; Grok Build | Grok 4.6 (August 2026) is its flagship ([SiliconANGLE](#src-grok46)); Grok Build is its coding model; Grok Bot is its workplace agent ([SpaceXAI](#src-xai-news)). |

Others to know: Xiaomi (MiMo), Zhipu (GLM) and Thinking Machines Lab (Inkling) publish notable open-weight models ([Tech Insider](#src-open-licences), [daily.dev](#src-deepseek)).

**Why this matters to security:**

- **Brand isn't model.** "Gemini", "Claude" or "Grok" names an app, an API and several models at once. Controls and data terms belong to a specific product, plan, model version and provider. See [Model vs app vs platform](#commonly-confused).
- **The strongest cyber capability is released in stages.** Several labs now give their most capable models to vetted defenders first. See [Trusted access programme](#trusted-access).
- **Open weights from many countries.** Some of the most capable downloadable models now come from Chinese labs ([daily.dev](#src-deepseek)). If you host one yourself, check its licence, provenance and behaviour; procurement rules or regulators may also ask where it came from. See [Open weights](#open-weights) and [Model files](#model-files).
- **Line-ups change monthly.** Pin versions and re-test when you change. See [Model versions and aliases](#model-versions).

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
35. <span id="src-claude-models"></span>Anthropic, [Models overview](https://platform.claude.com/docs/en/about-claude/models/whats-new-sonnet-4-5) and [Introducing Claude Fable 5 and Claude Mythos 5](https://platform.claude.com/docs/en/about-claude/models/introducing-claude-fable-5), Claude Platform Docs, November 2026.
36. <span id="src-claude-lineup"></span>nhimg, [Anthropic LLM models guide](https://nhimg.org/anthropic-llm-models-guide), November 2026.
37. <span id="src-gpt6"></span>TechCrunch, [OpenAI launches GPT-6 Sol and Luna](https://techcrunch.com/2026/09/22/openai-launches-gpt-6-sol-and-luna/), 22 September 2026.
38. <span id="src-astra"></span>9to5Mac, [OpenAI releasing major upgrade to ChatGPT and Codex with GPT-6 Astra](https://9to5mac.com/2026/09/04/openai-releasing-major-upgrade-to-chatgpt-and-codex-with-gpt-6-astra-details-here/), 4 September 2026. Critical cybersecurity threshold under the Preparedness Framework.
39. <span id="src-astra-availability"></span>OpenAI, [GPT-6 Astra: a new generation of intelligence](https://openai.com/lv-LV/index/gpt-6-astra/), September 2026. Availability through the OpenAI API, Microsoft Azure and AWS Bedrock.
40. <span id="src-openai-lineup"></span>nhimg, [OpenAI LLM models guide](https://nhimg.org/openai-llm-models-guide), as of 15 November 2026.
41. <span id="src-gemini4"></span>Google, [Gemini 4 Argon: our next era of frontier intelligence](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/), 30 September 2026.
42. <span id="src-gemini4-ja"></span>Google Japan blog, [Gemini 4 Argon](https://blog.google/intl/ja-jp/company-news/technology/gemini4argon/) (Japanese), 1 October 2026. CWE-bench results.
43. <span id="src-grayswan"></span>Google MENA blog, [Gemini 4 Argon: our next era of frontier intelligence](https://blog.google/intl/en-mena/company-news/technology/gemini-4-argon-our-next-era-of-frontier-intelligence/), 1 October 2026. Gray Swan indirect prompt injection benchmark.
44. <span id="src-carbon"></span>Let's Data Science, [Google rolls out Gemini 4 Carbon to general public](https://letsdatascience.com/news/google-rolls-out-gemini-4-carbon-to-general-public-9b41bcb4), November 2026.
45. <span id="src-model-cards-google"></span>Google DeepMind, [Model cards](https://deepmind.google/models/model-cards/), list as of November 2026.
46. <span id="src-model-cards-anthropic"></span>Anthropic, [Model cards](https://platform.claude.com/docs/resources/overview), list as of November 2026.
47. <span id="src-gemini-versions"></span>Google, [Gemini API models: model version name patterns](https://ai.google.dev/gemini-api/docs/models), November 2026.
48. <span id="src-muse"></span>Axios, [Meta debuts Muse Spark, first AI model under Alexandr Wang](https://www.axios.com/2026/04/08/meta-muse-alexandr-wang), 8 April 2026.
49. <span id="src-muse-open"></span>The New Stack, [Meta ships Muse Spark Open](https://thenewstack.io/meta-muse-spark-open/), 15 October 2026.
50. <span id="src-grok46"></span>SiliconANGLE, [SpaceXAI releases flagship Grok 4.6 model](https://siliconangle.com/2026/08/12/spacexai-releases-flagship-grok-4-6-model-advanced-reasoning-capabilities/), 12 August 2026.
51. <span id="src-xai-news"></span>SpaceXAI, [News](https://x.ai/news), November 2026.
52. <span id="src-open-weights"></span>PromptsRush, [Best open-weight models, November 2026](https://promptsrush.com/blog/best-open-weight-models), checked 12 November 2026.
53. <span id="src-open-licences"></span>Tech Insider, [IA open source : licences de Mistral Large 4, MiMo, DeepSeek, Qwen et Inkling](https://tech-insider.org/fr/ia-open-source-licences-mistral-large-4-mimo-deepseek-qwen-inkling-2026/) (French), November 2026.
54. <span id="src-deepseek"></span>daily.dev, [Open-weight models](https://daily.dev/agentic-ai-hub/open-weight-models/), July 2026.
55. <span id="src-metr"></span>METR, [Task-completion time horizons of frontier AI models](https://metr.org/time-horizons/), Time Horizon 1.1.
56. <span id="src-metr-paper"></span>Kwa et al. (METR), [Measuring AI ability to complete long tasks](https://arxiv.org/html/2503.14499v3), 2025.
57. <span id="src-swe-verified"></span>OpenAI, [Why SWE-bench Verified no longer measures frontier coding capabilities](https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/), 23 February 2026.
58. <span id="src-swe-pro"></span>Deng et al. (Scale AI), [SWE-Bench Pro](https://arxiv.org/html/2509.16941v2), 2025.
59. <span id="src-swe-pro-verified"></span>[SWE-Bench Pro Verified: a reliable benchmark for software engineering agents](https://arxiv.org/html/2609.08149), 2026.
60. <span id="src-pareto"></span>Google Japan blog, [Gemini 3 Flash](https://blog.google/intl/ja-jp/company-news/technology/gemini3-flash/) (Japanese), December 2025. Pareto frontier and GPQA Diamond score.
61. <span id="src-arena"></span>Singh et al., [The Leaderboard Illusion](https://arxiv.org/html/2504.20879v2), NeurIPS 2025.
62. <span id="src-cybench"></span>Zhang et al., [Cybench: a framework for evaluating cybersecurity capabilities and risks of language models](https://arxiv.org/html/2408.08926v2), 2024.
63. <span id="src-cybergym"></span>Wang et al., [CyberGym: evaluating AI agents' real-world cybersecurity capabilities at scale](https://arxiv.org/abs/2506.02548), 2025.
64. <span id="src-eval-aware"></span>Nguyen et al., [Probing and steering evaluation awareness of language models](https://arxiv.org/html/2507.01786v2), 2025.
65. <span id="src-metagaming"></span>OpenAI Alignment, [Metagaming](https://alignment.openai.com/metagaming/), 2026.
66. <span id="src-rsp"></span>Anthropic, [Responsible Scaling Policy](https://www.anthropic.com/responsible-scaling-policy), version 3.4 effective 8 July 2026; [AI Safety Levels explained](https://www.anthropic.com/research/responsible-scaling-policy-v3).
67. <span id="src-fsf"></span>Google, [Gemini 4 Argon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/?hl=en), safety section referring to the Frontier Safety Framework, September 2026.
68. <span id="src-duet-launch"></span>iThinkDiff, [Anthropic launches Claude Duet, a proactive AI agent app](https://www.ithinkdiff.com/claude-duet-anthropic-proactive-ai-agent-app/), October 2026.
69. <span id="src-duet-vm"></span>Make Tech Easier, [Claude Duet](https://maketecheasier.com/?p=863308), October 2026.
70. <span id="src-duet-safety"></span>BetaNews, [Claude Duet preview brings Anthropic's proactive agent to Pro and Max](https://betanews.com/article/proactive-ai-agent-claude-duet/), 21 October 2026.
71. <span id="src-dots-launch"></span>Unite.AI, [OpenAI rolls out dots agents powered by GPT-6 Astra in ChatGPT](https://www.unite.ai/?p=475867), 29 September 2026.
72. <span id="src-dots-computer"></span>BetaNews, [OpenAI launches dots, always-on ChatGPT agents with their own computers](https://betanews.com/article/openai-dots-agents-chatgpt/), 29 September 2026.
73. <span id="src-dots-rules"></span>IBTimes UK, [OpenAI launches Dots, always-on AI agents](https://www.ibtimes.co.uk/openai-launches-dots-ai-agents-workplace-tasks-1822734), 30 September 2026.
74. <span id="src-gemini-agent"></span>Implicator, [Google launches Gemini agent that gives AI coworkers their own Workspace email](https://implicator.ai/google-launches-gemini-agent-that-gives-ai-coworkers-their-own-workspace-email/), October 2026.
75. <span id="src-spark-beta"></span>Thurrott, [Gemini Spark now available in beta](https://www.thurrott.com/?p=336765), May 2026.
76. <span id="src-spark-duke"></span>Duke University, [Meet Gemini Spark, Google's 24/7 autonomous AI agent](https://sites.duke.edu/ddmc/2026/05/27/meet-gemini-spark-googles-24-7-autonomous-ai-agent/), 27 May 2026.
77. <span id="src-spark-tnw"></span>The Next Web, [Gemini Spark, a 24/7 agentic assistant you can email like a colleague](https://thenextweb.com/news/google-gemini-spark-agentic-assistant-gmail-io-2026), May 2026.
78. <span id="src-spark-vb"></span>VentureBeat, [Google's new AI agent can draft your emails, monitor your inbox and eventually spend your money](https://venturebeat.com/ai/googles-new-ai-agent-can-draft-your-emails-monitor-your-inbox-and-eventually-spend-your-money), May 2026.
79. <span id="src-grokbot-launch"></span>SpaceXAI, [Introducing Grok Bot](https://x.ai/news/introducing-grok-bot), 11 August 2026.
80. <span id="src-grokbot-plans"></span>GIGAZINE, [SpaceXAI releases Grok Bot](https://gigazine.net/gsc_news/en/20260812-spacexai-grok-bot/), 12 August 2026.
81. <span id="src-grokbot-eweek"></span>eWeek, [SpaceXAI's Grok Bot runs workplace tasks on its own cloud computer](https://www.eweek.com/news/grok-bot-ai-agent/), 12 August 2026.
82. <span id="src-muse-agent"></span>Meta, [Introducing Muse: the world's first personal AI agent built for everyone](https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/), 8 September 2026.
83. <span id="src-muse-agent-fc"></span>Fast Company, [Meta wants its new AI agent to run your digital life](https://fastcompany.com/91603856/meta-wants-its-new-ai-agent-to-run-your-digital-life), September 2026; Mac app per [Unite.AI](https://unite.ai/meta-launches-muse-mac-app-with-file-messages-and-calendar-access).
84. <span id="src-muse-link"></span>SiliconANGLE, [Meta debuts its 'secure by design' personal AI agent Muse](https://siliconangle.com/?p=846205), 8 September 2026.
85. <span id="src-openclaw"></span>TechRadar, [Here are the OpenClaw security risks you should know about](https://www.techradar.com/pro/here-are-the-openclaw-security-risks-you-should-know-about), 2026.
86. <span id="src-every-agents"></span>Every, [Personal agents comparison](https://every.to/personal-agents-comparison), 2026.

## Changes

- **27 November 2026:** added "Personal agents: the 2026 products" (always-on agents; Claude Duet, dots, Gemini agent, Gemini Spark, Grok Bot, Muse, OpenClaw).
- **27 November 2026:** added "Inside the AI stack" (harness, model aliases, inference providers and more), "Evaluating models" with a table of common benchmarks, and "Who makes the models".
- **27 November 2026:** added "Building software with AI" (vibe coding, AI-assisted development, coding agents, auto-approve, rules files, slopsquatting, toxic agent flows, AI in CI/CD, model files), with a matching confused pair and misconception.
- **27 November 2026:** added "Same idea, different names", Frameworks, and an entry on roles; moved OWASP LLM IDs to the 2026 edition; noted NIST's "confabulation" and "agent hijacking" and how OWASP and ATLAS file jailbreaks.
- **27 November 2026:** first version: 36 terms, 13 commonly confused pairs, 12 misconceptions and the vendor-speak decoder.

*Text CC BY 4.0. Café Security Research.*
