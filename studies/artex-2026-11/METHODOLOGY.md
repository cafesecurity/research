# Methodology

Study `artex-2026-11` · <!--if-brand-->Café Security Research<!--/if-brand--><!--if-named:{name}--> · Version 1.0, 22 November 2026

## Question

What does ARTEX's source code show about how it works, which safety features it has, what they leave out, and how defenders can spot it? Where does public reporting agree or disagree with the code?

## Approach

**Static review only.** The code was read, never built, installed or run. Each source was cloned into its own empty directory, outside any project, and no script or build tool was run from inside it. The only programs run were `git`, text searches, file comparisons and the two scripts in this repository's `scripts/` folder, which read files and never execute them.

**Read the wiring, not just the features.** The review followed each control from where it's defined to where it's applied: how agents are built and which tools they get, how approvals are set, where hooks attach, what the database seeds switch on or off, and what the deployment files expose. Defaults were taken from code, seed data and settings lookups, not from documentation.

**Check the negatives.** Claims that something is absent (no deny rules, no callers, no throttling) were checked by searching the whole tree, and are recorded in the claims file so the searches can be repeated.

**Cross-check across versions.** Line references use v0.3.15. The key findings were re-checked in v0.3.30, the latest release at the time.

**Check public reporting against the code.** Vendor and press claims were checked against their primary sources where possible, then against the code. Secondary sources are marked as such.

## Sources reviewed

| Key | What | Commit | Why |
| --- | --- | --- | --- |
| `artex-v0.3.15` | Surviving upstream copy of ARTEX (`RuoJi6/ARTEX`), tag v0.3.15 | `a91b27feb7168c1486f827559bc48a589a920012` | Citation base |
| `artex-v0.3.30` | Same copy, tag v0.3.30 | `6997a4661921395072290becc50380db8dacb04e` | Spot checks of the latest release |
| `failsafe` | FailSafe's source build (`failsafe-security/artex`) | `fd6376ca392e9eed093f4e627138f0003223579d` | Provenance notes, audit, deployment files |
| `norma-v0.4.3` | The agent engine (`Autumn-27/norma`), tag v0.4.3 | `320ae32989da97dd91469bb89164cbfe87d83d5d` | The engine ARTEX builds against |

The original repository (`Autumn-27/artex`) is no longer available. FailSafe's build started the review, but its notes overstate how close it is to upstream (claim C002), so upstream v0.3.15 became the citation base. The FailSafe README promotes the company's hosted service, so its audit was treated as a vendor document and checked against the code.

## Verifying the engine

ARTEX doesn't include its engine; it pins it by version and hash in `go.sum`. To confirm the public engine code is what ARTEX builds against, we computed Go's module hash over the `v0.4.3` tag (`scripts/verify_module_hash.py`) and compared it with ARTEX's pin. They match (C011). Go's own downloader confirmed the `go.mod` hash but couldn't finish because the engine needs a newer Go than was available, so the full hash was computed independently.

## Claims and statuses

Every finding is a claim in [`claims.yaml`](claims.yaml) with an ID, a statement, a status and evidence. Reports cite claims by ID.

| Status | Meaning |
| --- | --- |
| `code` | Checked against the pinned source code |
| `source` | Checked against a public primary source |
| `secondary` | From a report about someone else's research; find the primary before relying on it |
| `inference` | Our reasoning from the evidence, explained in the claim's note |
| `open` | Not settled |

## Reproducing the checks

1. **Get your own copies.** Clone each source listed above and check out the pinned commit, each into its own empty directory. This repository doesn't contain or download them. Don't build or run them, and never use prebuilt ARTEX images (claim C004).
2. **Install the one dependency:** `pip install -r scripts/requirements.txt` (PyYAML).
3. **Run the checker** from the repository root:

   ```sh
   python3 scripts/check_claims.py studies/artex-2026-11/claims.yaml \
     --source artex-v0.3.15=/path/to/artex-v0.3.15 \
     --source artex-v0.3.30=/path/to/artex-v0.3.30 \
     --source failsafe=/path/to/failsafe \
     --source norma-v0.4.3=/path/to/norma
   ```

   It refuses a copy at the wrong commit, checks every piece of code evidence, and lists the rest for checking by hand. You can pass only the sources you have; claims needing the others are skipped.
4. **Check the engine hash on its own** if you like:

   ```sh
   python3 scripts/verify_module_hash.py /path/to/norma github.com/Autumn-27/norma v0.4.3 \
     h1:DnmOhJPL6OZSMnCVYO5Ujh4yVINuDarEickVi9jx1hI=
   ```

At version 1.0: 64 code claims pass, none fail, and 20 are for checking by hand.

## What a passing check means, and doesn't

A passing check means the cited text is at the cited place in the pinned commit. It doesn't prove the claim's reading of that text is right. That's what review and challenge are for. Negative checks (`absent`) prove a pattern doesn't appear, not that the behaviour can't happen some other way.

## Limits

- Static only; runtime behaviour isn't confirmed.
- ARTEX's built-in prompts were reviewed for version 1.2 and are described in the [prompt design report](reports/prompt-design.md); the context-compression, chat and platform-assistant prompts weren't read in detail. Their wording isn't published ([publication policy](../../PUBLICATION_POLICY.md)).
- The engine's large context-compression package wasn't reviewed in depth.
- Forks differ. ReversingLabs counts 11 fork families (C122); these findings apply to the versions above.
- Whether a target can steer ARTEX's agents wasn't tested (C094).

## Use of AI

The code reading, searching and drafting for this study were done with an AI assistant (Claude, by Anthropic) working under the author's direction. The author set the questions and scope, and reviewed the findings. The review went through three passes that corrected its own errors ([corrections](CORRECTIONS.md)). Every code claim is checked by the script above rather than taken on trust.
