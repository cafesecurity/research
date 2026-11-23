---
title: "ARTEX: what the code says"
description: "What the source code of ARTEX, the AI hacking tool the FBI warned about in November 2026, shows about how it works, its safety features and how to defend against it, with guides for leaders, security teams, red teams and policy makers."
hide:
  - toc
---

<div class="hero" markdown="1">

# ARTEX: what the code says

A study of the source code of **ARTEX**, the open-source AI hacking tool the FBI warned about in November 2026<!--if-named:, by **{name}**-->. Every finding is a numbered claim with its evidence, so you can check it, challenge it, or build on it.

</div>

## Start where you fit

<div class="track-grid" markdown="1">

[**Overview**<br>The whole picture: what we found, where AI pentest agents are heading, and why this is controllable.](overview.md){ .track-card }

[**CISOs & leaders**<br>The risk in business terms, what to do about it, and the questions to put to your teams.](for-leaders.md){ .track-card }

[**Security teams**<br>The technical detail, indicators to hunt, and how to detect and shrink the surface.](for-security-teams.md){ .track-card }

[**Red teams & vendors**<br>Running autonomous offensive agents safely, and what model providers can do.](for-red-teams.md){ .track-card }

[**Policy & government**<br>What the technology is, why it matters at scale, and the open questions.](for-policy.md){ .track-card }

</div>

## The reference material

The guides above sit on top of a full, checkable evidence base:

- **[The study summary](study.md)** — the key findings, what the study contains, and how to cite it.
- **[The teardown report](teardown.md)** — how ARTEX works, its safety features and what they leave out.
- **[How the prompts are designed](prompt-design.md)** — where the attack behaviour actually comes from.
- **[The claims explorer](../claims.md)** — every finding as a numbered claim with its evidence. Search and filter.
- **[Questions and answers](faq.md)** and the **[methodology](methodology.md)**.

!!! info "Which code we read, and why you can trust it"
    This review is **not** based on the original author's repository — they withdrew it in October 2026 — and the one dangerous version of ARTEX was a backdoor planted in a **Docker image, not in the public source code**. So we read the public source at a pinned commit that predates that image, and cross-checked it against **FailSafe**, a supply-chain-clean rebuild that keeps the tool's full capability rather than defanging it. Every finding is pinned to an exact commit that anyone can re-check. The [methodology](methodology.md) sets this out in full.

## How this study works

- **Evidence first.** Every finding has a status — `code`, `source`, `secondary`, `inference` or `open` — and its evidence: a file, line range and commit for code, or a public source.
- **Reproducible.** A script re-checks every code claim against your own copies of the sources. The repository never contains or downloads the tools under review.
- **Open to scrutiny.** Anyone can [challenge a claim, add evidence or report a mistake](../about/contributing.md).
- **Corrections in public.** Each study keeps a list of every correction, including those made before publication.
- **Defensive.** We publish what defenders need and leave out what would mainly help attackers ([publication policy](../about/publication-policy.md)).
