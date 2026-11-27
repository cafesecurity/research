---
title: "AI security glossary for CISOs"
description: "Plain-English definitions of the AI and agent terms security leaders now hear every week: what each term means, why it matters to security, and the question to ask your vendor. With commonly confused terms, common misconceptions and a vendor-speak decoder."
---

# AI security glossary for CISOs

This glossary is for security leaders who need to ask good questions about AI before they can answer them. Each term has three parts: **what it is**, in plain English; **why it matters to security**; and the **question to ask your vendor** in a security review. Where a term matches an entry in the OWASP Top 10 for LLM Applications or the OWASP Top 10 for Agentic Applications, the entry is named so you can read further.

!!! note "Current as of November 2026"
    Products, standards and vendor settings in this field change month to month. Each page change is dated in [Changes](#changes) at the foot of the page. If something here is out of date or wrong, [tell us](../about/contributing.md).

<div class="cs-gloss-filter" markdown="0">
<label for="gloss-q">Find a term</label>
<input id="gloss-q" type="search" placeholder="For example: injection, MCP, memory" autocomplete="off" spellcheck="false">
<p id="gloss-count" class="cs-gloss-count" aria-live="polite"></p>
</div>

**On this page:** [The basics](#the-basics) · [How agents connect to things](#how-agents-connect-to-things) · [Attacks](#attacks) · [Defences and controls](#defences-and-controls) · [Governance](#governance) · [Commonly confused](#commonly-confused) · [Common misconceptions](#common-misconceptions) · [Vendor-speak decoder](#vendor-speak-decoder) · [Sources](#sources)

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
- **Why it matters:** It is guidance, not a security boundary. Attackers can often get a model to reveal or ignore it, so it should never hold secrets or be the only rule stopping a dangerous action. OWASP: LLM07 System Prompt Leakage ([OWASP LLM](#src-owasp-llm)).
- **Ask your vendor:** Which of your safeguards are enforced in code, and which only in the prompt?

</div>

<div class="cs-term" markdown="1">

### Hallucination { #hallucination }

- **What it is:** When a model states something false with confidence: a made-up citation, policy or figure.
- **Why it matters:** In an agent, a made-up detail can become an action. One known case is the invented software package: code models suggest libraries that don't exist, and an attacker can register the name and publish malware under it. This is called slopsquatting ([CSO Online](#src-slopsquatting)). OWASP: LLM09 Misinformation.
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
- **Why it matters:** Embeddings are derived from your data. Give the vector store the same access control, encryption and retention rules as the source documents. OWASP: LLM08 Vector and Embedding Weaknesses.
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

- **What it is:** Instructions slipped into a model's input to make it do something it shouldn't. *Direct*: the user types them. *Indirect*: they are hidden in content the agent reads, such as an email, web page, document or calendar invite ([NIST](#src-nist-aml)).
- **Why it matters:** Indirect injection is the big one for business, because the attacker never needs access to your systems, only to something your agent will read. It is first in the OWASP Top 10 for LLM Applications (LLM01), and its agentic form, ASI01 Agent Goal Hijack, is first in the agentic list. We know of no defence that stops it completely, so design on the basis that it will sometimes work.
- **Ask your vendor:** What happens when the agent reads a malicious instruction? What stops the action, and does that check sit outside the model?

</div>

<div class="cs-term" markdown="1">

### Jailbreak { #jailbreak }

- **What it is:** Getting a model to ignore its own safety rules, usually through clever wording or role-play.
- **Why it matters:** It shows that a model's own refusals are not a dependable control. Plan as if any model can be talked round.
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
- **Why it matters:** An agent that can only read can still leak, if its output is rendered automatically. OWASP: LLM05 Improper Output Handling.
- **Ask your vendor:** Does the product load external images or links from model output automatically, and can we turn that off?

</div>

<div class="cs-term" markdown="1">

### Data poisoning { #data-poisoning }

- **What it is:** Corrupting the data a model learns from or relies on (training data, fine-tuning sets, RAG sources) to change how it behaves. OWASP: LLM04 Data and Model Poisoning.
- **Why it matters:** The attack can be planted long before it is used, and it is hard to spot afterwards.
- **Ask your vendor:** Where does the model's training and grounding data come from, and how is it checked?

</div>

<div class="cs-term" markdown="1">

### Tool misuse / excessive agency { #tool-misuse }

- **What it is:** An agent using legitimate tools in harmful ways, often because it was given more permissions or autonomy than the task needed. OWASP: LLM06 Excessive Agency, ASI02 Tool Misuse and ASI03 Identity & Privilege Abuse.
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

### Data retention / zero data retention (ZDR) { #data-retention }

- **What it is:** How long the vendor keeps your prompts, files and outputs. Zero data retention means the vendor doesn't store them after the request is answered, on the terms it publishes.
- **Why it matters:** Retention is a separate promise from training. Agents that work in the background also keep task history, memory and logs, which may follow different rules.
- **Ask your vendor:** What is kept, for how long, for which features, and what does your ZDR offer exclude?

</div>

## Commonly confused

| These terms | The difference |
| --- | --- |
| **Prompt injection vs jailbreak** | Injection makes the AI follow an attacker's instructions instead of yours. A jailbreak makes it ignore its own safety rules. A jailbreak usually needs the attacker to be the user; injection doesn't. |
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

## Vendor-speak decoder

| They say | Ask |
| --- | --- |
| "Enterprise-grade guardrails" | Which ones, enforced where, and which plan includes them? |
| "Secure by design" | What happens when the model is fooled? |
| "Human in the loop" | How many approvals a day will a typical user see? |
| "Your data stays yours" | What is the retention period, is it used for training, and who at the vendor can see it? |
| "Agents act with your permissions" | So a compromised agent has all of them? |

## Sources

Checked on 27 November 2026.

1. <span id="src-owasp-llm"></span>OWASP GenAI Security Project, [OWASP Top 10 for LLM Applications 2025](https://genai.owasp.org/llm-top-10/). Entry IDs LLM01 to LLM10.
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

## Changes

- **27 November 2026:** first version. 36 terms, 13 commonly confused pairs, 12 misconceptions and the vendor-speak decoder.

*Text CC BY 4.0. Café Security Research.*
