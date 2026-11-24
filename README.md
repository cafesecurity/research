# Café Security Research

Open, reproducible research on AI and cybersecurity.

Each study here publishes its raw findings and its method, not just its conclusions. Every finding is a numbered claim with its evidence, so you can check it, challenge it or build on it. Reports, videos and tools are made from the claims, and a correction to a claim reaches all of them.

The studies are published at [research.cafesecurity.com](https://research.cafesecurity.com/), alongside practical guides kept in their own repositories, such as the [MCP Security Guide](https://github.com/cafesecurity/mcp-security-guide).

## Studies

| Study | Question | Status |
| --- | --- | --- |
| [ARTEX: what the code says](studies/artex-2026-11/) | What does the source code of ARTEX, the AI hacking tool the FBI warned about in November 2026, show about how it works, its safety features, and how to spot it? | v1.3, 23 Nov 2026 |

## How the research works

- **Evidence first.** Every finding is a claim in a study's `claims.yaml`, with a status (`code`, `source`, `secondary`, `inference` or `open`) and its evidence: a file, line range and commit for code, or a public source.
- **Reproducible.** `scripts/check_claims.py` re-checks every code claim against your own copies of the pinned sources. This repository never contains or downloads the tools under review.
- **Open to scrutiny.** Anyone can challenge a claim, add evidence or report a mistake (see [CONTRIBUTING.md](CONTRIBUTING.md)).
- **Corrections in public.** Each study keeps a `CORRECTIONS.md`, including corrections made before publication.
- **Defensive.** Studies publish what defenders need and leave out what would mainly help attackers (see [PUBLICATION_POLICY.md](PUBLICATION_POLICY.md)).

## Layout

```
studies/<study>/
  README.md        summary, key findings, how to check and cite
  claims.yaml      the claims and their evidence (source of truth)
  faq.yaml         plain answers to common questions, citing claim IDs
  METHODOLOGY.md   what was reviewed, how, and how to reproduce it
  CORRECTIONS.md   every correction, with what changed
  reports/         outputs for different readers, citing claim IDs
scripts/           checking and site-building tools (Python, MIT)
site/              the website's own pages, styles and scripts
mkdocs.yml         website configuration
wrangler.jsonc     hosting on Cloudflare
```

## The website

`scripts/build_site.py` turns the studies into the source of research.cafesecurity.com: it links every claim ID to the claims explorer, renders each study's claims and FAQ as pages, and fails on unknown claim IDs or broken links. To build it locally:

```sh
pip install -r site/requirements.txt
python3 scripts/build_site.py && mkdocs build --strict   # output in _site/
```

Each study has a short address on the site (`/artex/` for `studies/artex-2026-11/`), set in `STUDY_PATHS` in the build script. Old addresses are redirected in `site/pages/_redirects`.

**Guides from other repositories.** `site/guides.json` lists guides published on the site from their own repositories, each pinned to a commit. The build fetches that commit (into `.cache/`, which git ignores) and publishes it under the guide's key, so the MCP Security Guide appears at `/mcp/`. Links to the guide's other files, such as its scripts and skills, point to GitHub at the same commit. To publish a newer version, change the commit (or a release tag's commit) in `guides.json`. To preview local edits to a guide, set `GUIDE_DIR_MCP` to your checkout.

The site is hosted on Cloudflare as a Workers static-assets site. Cloudflare runs the same build on every push, deploys `main` to research.cafesecurity.com, and serves it nowhere else (no `workers.dev` or preview addresses). Pull requests are checked by the GitHub Actions build. Response headers, including the content security policy, are in `site/pages/_headers`.

**Author name.** By default the site credits Café Security Research only. To add a personal byline across every page, its footer and the search-engine data, set the build variable `SITE_AUTHOR` to the name as it should appear (title included), and optionally `SITE_AUTHOR_LINKS` to comma-separated profile URLs. In Cloudflare these go under the Worker's Settings → Build → Variables and secrets. Unset them to go back to brand only.

## Licence

Text and data: [CC BY 4.0](LICENSES/CC-BY-4.0.txt). Scripts: [MIT](LICENSES/MIT.txt). See [LICENSE.md](LICENSE.md). Short quotations of reviewed source code remain under their own licences.

## Cite

See [CITATION.cff](CITATION.cff), or cite a study using the line in its README.

## About

Café Security Research researches and explains where AI and cybersecurity meet.
