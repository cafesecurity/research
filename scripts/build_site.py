#!/usr/bin/env python3
"""Assemble the source of research.cafesecurity.com from this repository.

The repository's Markdown and YAML stay the single source of truth. This script copies
the pages the site shows into _site_src/, rewrites their links for the site, links every
claim ID to the claims explorer, renders each study's claims and FAQ as pages, and writes
the claims as JSON. MkDocs then builds _site_src/ into _site/.

It fails, listing every problem, if a claim or reference ID is unknown, a link points
nowhere, or a claim is missing a required field.

Author name. By default pages credit Café Security Research only. Set SITE_AUTHOR (for
example "Dr Jane Smith") to add a personal byline: text marked <!--if-named:...--> is
shown, with {name}, {plain} and {cite} filled in, and <!--if-brand-->...<!--/if-brand-->
is hidden. Without SITE_AUTHOR the reverse happens. The markers are HTML comments, so
the repository's own Markdown reads as brand-only on GitHub.

Usage:  python3 scripts/build_site.py && mkdocs build --strict

Licence: MIT. Café Security Research.
"""

import hashlib
import html
import json
import os
import posixpath
import re
import shutil
import subprocess
import sys

import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "_site_src")
SITE = os.path.join(ROOT, "site")
REPO_URL = "https://github.com/cafesecurity/research"
BRANCH = "main"

# Each study's short address on the site: /artex/ rather than /studies/artex-2026-11/.
STUDY_PATHS = {"artex-2026-11": "artex"}

# Guides published from their own repositories, at the commit pinned in GUIDES_LOCK.
GUIDES_LOCK = os.path.join(SITE, "guides.json")
GUIDES_CACHE = os.path.join(ROOT, ".cache", "guides")

STATUSES = {
    "code": "Checked against the pinned source code",
    "source": "Checked against a public source",
    "secondary": "From a report about someone else's research",
    "inference": "Our reasoning from the evidence; the reasoning is in the note",
    "open": "Not settled",
}
TOPICS = {
    "agents": "Agents", "console": "Console", "context": "Other AI tools",
    "detection": "Detection", "engine": "Engine", "framing": "Framing", "law": "Law",
    "limits": "Limits", "models": "AI models", "prompts": "Prompt design", "provenance": "Provenance",
    "recording": "Recording", "reporting": "Reporting", "safety": "Safety controls",
    "secrets": "Secrets", "tools": "Tools",
}
CLAIM_ID = re.compile(r"\bC\d{3}\b")
# Inline code, links and images, autolinks or HTML tags, bare URLs: left alone when
# linking claim IDs.
TOKEN = re.compile(
    r"(?P<code>(`+).+?\2)"
    r"|(?P<link>!?\[(?P<text>[^\]]*)\]\((?P<url>[^)\s]+)(?P<title>\s+\"[^\"]*\")?\))"
    r"|(?P<tag><[^>\n]+>)"
    r"|(?P<bare>https?://[^\s)>\]|]+)"
)

errors = []
CLAIM_STUDY = {}

TITLES = {"dr", "prof", "professor", "mr", "mrs", "ms", "mx"}


def author_fields():
    """The author's name in three forms, from SITE_AUTHOR, or None for brand-only."""
    full = " ".join(os.environ.get("SITE_AUTHOR", "").split())
    if not full:
        return None
    words = full.split()
    plain = words[1:] if words[0].lower().rstrip(".") in TITLES and len(words) > 2 else words
    cite = f"{plain[-1]}, {'. '.join(w[0] for w in plain[:-1])}." if len(plain) > 1 else plain[0]
    return {"name": full, "plain": " ".join(plain), "cite": cite}


AUTHOR = author_fields()
NAMED = re.compile(r"<!--if-named:(.*?)-->", re.S)
BRAND = re.compile(r"<!--if-brand-->(.*?)<!--/if-brand-->", re.S)


def personalise(text, where):
    """Apply the author-name markers for this build."""
    if AUTHOR:
        text = BRAND.sub("", text)
        text = NAMED.sub(lambda m: m.group(1).format(**AUTHOR), text)
    else:
        text = NAMED.sub("", text)
        text = BRAND.sub(lambda m: m.group(1), text)
    if "<!--if-named" in text or "<!--if-brand" in text or "<!--/if-brand" in text:
        fail(f"{where}: unbalanced author-name marker")
    return text


def fail(msg):
    errors.append(msg)


def read(rel):
    with open(os.path.join(ROOT, rel), encoding="utf-8") as f:
        return personalise(f.read(), rel)


WRITTEN = set()


def write(rel, text):
    if rel in WRITTEN:
        fail(f"two sources write the same site page {rel}")
    WRITTEN.add(rel)
    path = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)


def studies():
    base = os.path.join(ROOT, "studies")
    return sorted(d for d in os.listdir(base) if os.path.isfile(os.path.join(base, d, "claims.yaml")))


def page_map(study_ids):
    """Repository path -> site path, for every repository file the site shows."""
    m = {
        "PUBLICATION_POLICY.md": "about/publication-policy.md",
        "CONTRIBUTING.md": "about/contributing.md",
        "SECURITY.md": "about/security.md",
        "LICENSE.md": "about/licence.md",
    }
    for s in study_ids:
        d = f"studies/{s}"
        if s not in STUDY_PATHS:
            fail(f"{d}: give the study a short address in STUDY_PATHS in build_site.py")
            continue
        p = STUDY_PATHS[s]
        m[f"{d}/README.md"] = f"{p}/study.md"
        m[f"{d}/METHODOLOGY.md"] = f"{p}/methodology.md"
        m[f"{d}/CORRECTIONS.md"] = f"{p}/corrections.md"
        m[f"{d}/claims.yaml"] = "claims.md"
        m[f"{d}/faq.yaml"] = f"{p}/faq.md"
        reports = os.path.join(ROOT, d, "reports")
        if os.path.isdir(reports):
            for name in sorted(os.listdir(reports)):
                if name.endswith(".md"):
                    m[f"{d}/reports/{name}"] = f"{p}/{name}"
    return m


def load_study(s):
    data = yaml.safe_load(read(f"studies/{s}/claims.yaml"))
    refs = data.get("references") or {}
    claims = data.get("claims") or []
    seen = set()
    for c in claims:
        cid = c.get("id", "?")
        for field in ("id", "topic", "statement", "status", "evidence"):
            if not c.get(field):
                fail(f"{s} {cid}: missing {field}")
        if cid in seen:
            fail(f"{s} {cid}: duplicate ID")
        seen.add(cid)
        if c.get("status") not in STATUSES:
            fail(f"{s} {cid}: unknown status {c.get('status')!r}")
        if c.get("topic") not in TOPICS:
            fail(f"{s} {cid}: topic {c.get('topic')!r} has no label in build_site.py")
        for ev in c.get("evidence") or []:
            if ev.get("type") == "url" and ev.get("ref") not in refs:
                fail(f"{s} {cid}: unknown reference {ev.get('ref')!r}")
            if ev.get("source") and ev["source"] not in (data.get("sources") or {}):
                fail(f"{s} {cid}: unknown source {ev['source']!r}")
        for ref in CLAIM_ID.findall(c.get("note", "")):
            if ref not in {x.get("id") for x in claims}:
                fail(f"{s} {cid}: note mentions unknown claim {ref}")
    return data


def anchor(study, cid):
    return f"{study}-{cid}"


def rel_link(from_site_path, to_site_path, frag=""):
    rel = posixpath.relpath(to_site_path, posixpath.dirname(from_site_path) or ".")
    return rel + (f"#{frag}" if frag else "")


def rewrite_url(url, src_rel, dst_rel, pages, text=None, study=None):
    """Point a link from a repository file at the right place on the site.

    Hand-written site pages (pages=None) already use site paths; there, `repo:PATH`
    links to a file in the repository on GitHub.
    """
    if url.startswith("repo:"):
        target = url[5:].partition("#")[0]
        if not os.path.exists(os.path.join(ROOT, target)):
            fail(f"{src_rel}: link to {url!r} points nowhere")
        kind = "tree" if os.path.isdir(os.path.join(ROOT, target)) else "blob"
        return f"{REPO_URL}/{kind}/{BRANCH}/{url[5:]}"
    if pages is None:
        return url
    if re.match(r"^[a-z][a-z0-9+.-]*:", url, re.I) or url.startswith("#"):
        return url
    path, _, frag = url.partition("#")
    target = posixpath.normpath(posixpath.join(posixpath.dirname(src_rel), path))
    if os.path.isdir(os.path.join(ROOT, target)) and f"{target}/README.md" in pages:
        target = f"{target}/README.md"
    if target in pages:
        if target.endswith("claims.yaml") and text and CLAIM_ID.fullmatch(text.strip("`")) and study:
            frag = anchor(study, text.strip("`"))
        return rel_link(dst_rel, pages[target], frag)
    full = os.path.join(ROOT, target)
    m = re.fullmatch(r"\.github/ISSUE_TEMPLATE/([\w-]+\.ya?ml)", target)
    if m and os.path.exists(full) and m.group(1) != "config.yml":
        return f"{REPO_URL}/issues/new?template={m.group(1)}"
    if os.path.exists(full):
        kind = "tree" if os.path.isdir(full) else "blob"
        return f"{REPO_URL}/{kind}/{BRANCH}/{target}" + (f"#{frag}" if frag else "")
    fail(f"{src_rel}: link to {url!r} points nowhere")
    return url


def link_claims_any(segment, dst_rel, study, known):
    """Link claim IDs. For repo pages a study is given; for site pages resolve via the index."""
    if study:
        return link_claims(segment, dst_rel, study, known)
    def sub(m):
        cid = m.group(0)
        st = CLAIM_STUDY.get(cid)
        if not st:
            fail(f"{dst_rel}: mentions unknown claim {cid}")
            return cid
        return f"[{cid}]({rel_link(dst_rel, 'claims.md', anchor(st, cid))})"
    return CLAIM_ID.sub(sub, segment)


def link_claims(segment, dst_rel, study, known):
    def sub(m):
        cid = m.group(0)
        if cid not in known:
            fail(f"{dst_rel}: mentions unknown claim {cid}")
            return cid
        return f"[{cid}]({rel_link(dst_rel, 'claims.md', anchor(study, cid))})"
    return CLAIM_ID.sub(sub, segment)


def convert_markdown(text, src_rel, dst_rel, pages, study=None, known=(), claims=True, rewrite=None):
    out, fence = [], None
    lines = text.split("\n")
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.lstrip()
        if fence is None and stripped.startswith("```mermaid"):
            body = []
            i += 1
            while i < len(lines) and not lines[i].lstrip().startswith("```"):
                body.append(lines[i])
                i += 1
            out.append(inline_diagram("\n".join(body) + "\n", src_rel))
            i += 1
            continue
        m = re.match(r"(`{3,}|~{3,})", stripped)
        if m:
            fence = None if fence and stripped.startswith(fence) else (fence or m.group(1))
            out.append(line)
            i += 1
            continue
        if fence:
            out.append(line)
            i += 1
            continue
        pieces, pos = [], 0
        for t in TOKEN.finditer(line):
            plain = line[pos:t.start()]
            pieces.append(link_claims_any(plain, dst_rel, study, known) if claims else plain)
            if t.group("link"):
                url = (rewrite(t.group("url")) if rewrite else
                       rewrite_url(t.group("url"), src_rel, dst_rel, pages, t.group("text"), study))
                bang = "!" if t.group(0).startswith("!") else ""
                pieces.append(f"{bang}[{t.group('text')}]({url}{t.group('title') or ''})")
            else:
                pieces.append(t.group(0))
            pos = t.end()
        rest = line[pos:]
        pieces.append(link_claims_any(rest, dst_rel, study, known) if claims else rest)
        out.append("".join(pieces))
        i += 1
    return "\n".join(out)


def inline_diagram(source, src_rel):
    """Swap a Mermaid block for its pre-rendered SVG, so the site loads no diagram library."""
    digest = hashlib.sha256(source.encode("utf-8")).hexdigest()[:16]
    svg_path = os.path.join(SITE, "assets", "diagrams", f"{digest}.svg")
    if not os.path.exists(svg_path):
        fail(f"{src_rel}: no rendered diagram for this Mermaid block. Render it with:\n"
             f"    npx -p @mermaid-js/mermaid-cli@11.17.1 mmdc -i block.mmd -c site/diagrams/mermaid-config.json "
             f"-b transparent -I d{digest} -o site/assets/diagrams/{digest}.svg\n"
             f"  where block.mmd holds the block's lines exactly")
        return ""
    with open(svg_path, encoding="utf-8") as f:
        svg = f.read().strip()
    return (f'<figure class="diagram" markdown="0">{svg}'
            f'<figcaption class="diagram-hint">Scroll sideways to see the whole diagram.</figcaption></figure>')


def front_matter(hide=(), **fields):
    lines = ["---"]
    for k, v in fields.items():
        lines.append(f"{k}: {json.dumps(v, ensure_ascii=False)}")
    if hide:
        lines.append("hide:")
        lines.extend(f"  - {h}" for h in hide)
    lines.append("---\n")
    return "\n".join(lines)


def inline_html(text, study=None, page="claims.md"):
    """Escape text and render `code`, then link claim IDs (for the generated pages)."""
    parts = re.split(r"(`[^`]+`)", text)
    out = []
    for p in parts:
        if p.startswith("`") and p.endswith("`") and len(p) > 1:
            out.append(f"<code>{html.escape(p[1:-1])}</code>")
        else:
            e = html.escape(p, quote=False)
            if study:
                base = "" if page == "claims.md" else rel_link(page, "claims.md")
                e = CLAIM_ID.sub(lambda m: f'<a href="{base}#{anchor(study, m.group(0))}">{m.group(0)}</a>', e)
            out.append(e)
    return "".join(out)


def describe_evidence(ev, data):
    kind = ev.get("type")
    src = ev.get("source")
    where = ""
    if ev.get("path"):
        where = f"<code>{html.escape(ev['path'])}</code>" + (f", lines {html.escape(str(ev['lines']))}" if ev.get("lines") else "")
    if kind == "url":
        ref = data["references"][ev["ref"]]
        label = html.escape(ref["title"])
        bits = [html.escape(str(ref.get("publisher", ""))), html.escape(str(ref.get("date", "")))]
        sec = " (secondary)" if ref.get("secondary") else ""
        return (f'<span class="ev-kind">{ev["ref"]}</span> <a href="{html.escape(ref["url"])}" rel="noopener">{label}</a>'
                f' <span class="ev-meta">{" · ".join(b for b in bits if b)}{sec}</span>')
    if kind == "manual":
        return f'<span class="ev-kind">By hand</span> {inline_html(ev.get("how", ""))}'
    if kind == "contains":
        return f'<span class="ev-kind">Contains</span> “{html.escape(ev["text"])}” in <code>{src}</code> {where}'
    if kind == "absent":
        scope = ", ".join(ev.get("include") or []) or "all files"
        loc = where or f"files matching <code>{html.escape(scope)}</code>"
        return f'<span class="ev-kind">Absent</span> pattern <code>{html.escape(ev["pattern"])}</code> in <code>{src}</code>, {loc}'
    if kind in ("file_exists", "file_missing"):
        word = "Exists" if kind == "file_exists" else "Missing"
        paths = ", ".join(f"<code>{html.escape(p)}</code>" for p in ev.get("paths", []))
        return f'<span class="ev-kind">{word}</span> {paths} in <code>{src}</code>'
    if kind == "differs":
        return (f'<span class="ev-kind">Differs</span> {len(ev.get("paths", []))} files between '
                f'<code>{ev["a"]}</code> and <code>{ev["b"]}</code>')
    if kind == "module_hash":
        return (f'<span class="ev-kind">Module hash</span> <code>{html.escape(ev["module"])}@{html.escape(ev["version"])}</code> '
                f'in <code>{src}</code> is <code>{html.escape(ev["h1"])}</code>')
    fail(f"unknown evidence type {kind!r}")
    return html.escape(str(ev))


def claims_page(all_data):
    multi = len(all_data) > 1
    topics = sorted({c["topic"] for d in all_data.values() for c in d["claims"]}, key=lambda t: TOPICS[t])
    total = sum(len(d["claims"]) for d in all_data.values())
    parts = [front_matter(
        hide=["toc"],
        title="Claims explorer",
        description="Every finding in Café Security Research's studies as a numbered claim, with its status and evidence. Search, filter and link to any claim.",
    )]
    parts.append("# Claims explorer\n")
    parts.append(
        "Every finding in these studies is a numbered claim with its status and evidence. "
        "Reports, the FAQ and videos cite claims by ID, so a correction here reaches all of them. "
        "Search and filter below, or link straight to a claim: each one has its own address.\n"
    )
    parts.append(
        '<details class="statuses"><summary>What the statuses mean</summary><dl>'
        + "".join(f'<dt><span class="status status-{k}">{k}</span></dt><dd>{v}</dd>' for k, v in STATUSES.items())
        + "</dl></details>\n"
    )
    study_opts = "".join(f'<option value="{s}">{html.escape(d["title"])}</option>' for s, d in all_data.items())
    topic_opts = "".join(f'<option value="{t}">{TOPICS[t]}</option>' for t in topics)
    status_opts = "".join(f'<option value="{k}">{k}</option>' for k in STATUSES)
    parts.append(f"""<form class="claim-filters" id="claim-filters" hidden role="search" aria-label="Filter claims" markdown="0">
<label>Search <input type="search" name="text" placeholder="For example: scope, recording, C083" autocomplete="off"></label>
<label{' hidden' if not multi else ''}>Study <select name="study"><option value="">All studies</option>{study_opts}</select></label>
<label>Topic <select name="topic"><option value="">All topics</option>{topic_opts}</select></label>
<label>Status <select name="status"><option value="">All statuses</option>{status_opts}</select></label>
<button type="reset">Clear</button>
</form>
<p class="claim-count" id="claim-count" aria-live="polite">{total} claims</p>
""")
    for s, d in all_data.items():
        parts.append(f'<section class="claim-study" data-study="{s}" markdown="0">')
        parts.append(f'<h2 id="{s}">{html.escape(d["title"])}</h2>')
        parts.append(f'<p class="claim-study-meta">Study <code>{s}</code> · checked {html.escape(str(d.get("checked", "")))} · '
                     f'<a href="{REPO_URL}/blob/{BRANCH}/studies/{s}/claims.yaml">raw <code>claims.yaml</code></a></p>')
        for c in d["claims"]:
            aid = anchor(s, c["id"])
            evs = "".join(f"<li>{describe_evidence(ev, d)}</li>" for ev in c["evidence"])
            note = f'<p class="claim-note"><strong>Note.</strong> {inline_html(c["note"], s)}</p>' if c.get("note") else ""
            parts.append(
                f'<article class="claim" id="{aid}" data-study="{s}" data-topic="{c["topic"]}" data-status="{c["status"]}">'
                f'<header><a class="claim-id" href="#{aid}" aria-label="Link to claim {c["id"]}">{c["id"]}</a>'
                f'<span class="status status-{c["status"]}" title="{html.escape(STATUSES[c["status"]])}">{c["status"]}</span>'
                f'<span class="topic">{TOPICS[c["topic"]]}</span></header>'
                f'<p class="claim-statement">{inline_html(c["statement"], s)}</p>{note}'
                f'<details class="claim-evidence"><summary>Evidence ({len(c["evidence"])})</summary><ul>{evs}</ul></details>'
                f"</article>"
            )
        parts.append("</section>")
    parts.append('\n<p class="claim-none" id="claim-none" hidden>No claims match. Try fewer words or clear the filters.</p>\n')
    return "\n".join(parts) + "\n"


def faq_page(s, faq, data, dst_rel):
    known = {c["id"] for c in data["claims"]}
    parts = [front_matter(hide=["toc"], title=faq["title"], description=faq["description"])]
    parts.append(f"# {faq['title']}\n")
    parts.append(f"{faq['description']} Updated {faq['updated']}. This is general information, not legal or professional advice.\n")
    parts.append("<nav class=\"faq-index\" aria-label=\"Questions\" markdown=\"1\">\n")
    for q in faq["questions"]:
        parts.append(f"- [{q['question']}](#{q['id']})")
    parts.append("\n</nav>\n")
    entities = []
    for q in faq["questions"]:
        for cid in q.get("claims", []):
            if cid not in known:
                fail(f"{s}/faq.yaml {q['id']}: unknown claim {cid}")
        answer = q["answer"].strip()
        links = ", ".join(f"[{cid}]({rel_link(dst_rel, 'claims.md', anchor(s, cid))})" for cid in q.get("claims", []))
        parts.append(f"## {q['question']} {{#{q['id']}}}\n")
        parts.append(convert_markdown(answer, f"studies/{s}/faq.yaml", dst_rel, {}, s, known) + "\n")
        parts.append(f'<p class="faq-evidence" markdown="1">Evidence: {links}</p>\n')
        entities.append({"@type": "Question", "name": q["question"],
                         "acceptedAnswer": {"@type": "Answer", "text": answer}})
    ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": entities}
    parts.append('<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False).replace("</", "<\\/") + "</script>\n")
    return "\n".join(parts)


# ---------------------------------------------------------------------------
# Guides published from their own repositories.

GUIDE_SECTIONS = ("guide", "reference", "checklists")
GUIDE_TOP = {"README.md": "index.md", "QUICKSTART.md": "quickstart.md", "CHANGELOG.md": "changelog.md"}


def fetch_guide(key, g):
    """A checkout of the guide at its pinned commit. GUIDE_DIR_<KEY> overrides it for local edits."""
    override = os.environ.get(f"GUIDE_DIR_{key.upper()}")
    if override:
        return os.path.abspath(override)
    dest = os.path.join(GUIDES_CACHE, key)
    env = {**os.environ, "GIT_TERMINAL_PROMPT": "0"}
    def git(*args):
        return subprocess.run(["git", "-C", dest, *args], check=True, env=env,
                              capture_output=True, text=True).stdout.strip()
    if os.path.isdir(os.path.join(dest, ".git")):
        try:
            if git("rev-parse", "HEAD") == g["commit"]:
                return dest
        except subprocess.CalledProcessError:
            pass
    shutil.rmtree(dest, ignore_errors=True)
    os.makedirs(dest)
    try:
        git("init", "-q")
        git("fetch", "-q", "--depth", "1", g["repo"], g["commit"])
        git("-c", "advice.detachedHead=false", "checkout", "-q", "FETCH_HEAD")
        if git("rev-parse", "HEAD") != g["commit"]:
            raise RuntimeError("fetched the wrong commit")
        if g.get("tag"):
            out = git("ls-remote", g["repo"], f"refs/tags/{g['tag']}^{{}}", f"refs/tags/{g['tag']}")
            shas = {line.split()[0] for line in out.splitlines() if line.strip()}
            if g["commit"] not in shas:
                raise RuntimeError(f"tag {g['tag']} does not point at the pinned commit")
    except (subprocess.CalledProcessError, RuntimeError) as e:
        detail = getattr(e, "stderr", "") or str(e)
        fail(f"guide {key}: could not fetch {g['repo']} at {g['commit']}: {detail.strip()}")
        return None
    return dest


def guide_title(text):
    m = re.search(r"^# (.+)$", text, re.M)
    return m.group(1).strip() if m else ""


def guide_description(text):
    """The first paragraph after the title, as plain text, for search engines."""
    body = text.split("\n# ", 1)[-1].split("\n", 1)[-1] if text.startswith("# ") else text
    for para in re.split(r"\n\s*\n", body):
        p = para.strip()
        if not p or p.startswith(("#", "|", "-", "```", ">", "*Generated")):
            continue
        p = re.sub(r"!?\[([^\]]*)\]\([^)]*\)", r"\1", p)
        p = re.sub(r"[*_`]", "", " ".join(p.split()))
        return p if len(p) <= 200 else p[:197].rsplit(" ", 1)[0] + "…"
    return ""


def build_guide(key, g):
    src = fetch_guide(key, g)
    if not src:
        return None
    base = key
    repo, commit = g["repo"].rstrip("/"), g["commit"]
    ref = g.get("tag") or commit  # what GitHub links point at
    gmap = {name: f"{base}/{dst}" for name, dst in GUIDE_TOP.items() if os.path.exists(os.path.join(src, name))}
    for sec in GUIDE_SECTIONS:
        d = os.path.join(src, sec)
        for name in sorted(os.listdir(d)) if os.path.isdir(d) else []:
            if name.endswith(".md"):
                gmap[f"{sec}/{name}"] = f"{base}/{sec}/{name}"
    dir_index = {"checklists": f"{base}/checklists/index.md"}

    def github(path, frag=""):
        kind = "tree" if os.path.isdir(os.path.join(src, path)) else "blob"
        return f"{repo}/{kind}/{ref}/{path}" + (f"#{frag}" if frag else "")

    for src_rel, dst_rel in gmap.items():
        with open(os.path.join(src, src_rel), encoding="utf-8") as f:
            text = f.read()
        # Repository housekeeping that means nothing to a reader of the website.
        text = re.sub(r" Edit the pages?, not this file\.", "", text)
        text = text.replace(" by `scripts/build_checklists.py`", "")

        def rewrite(url, src_rel=src_rel, dst_rel=dst_rel):
            if re.match(r"^[a-z][a-z0-9+.-]*:", url, re.I) or url.startswith("#"):
                return url
            path, _, frag = url.partition("#")
            target = posixpath.normpath(posixpath.join(posixpath.dirname(src_rel), path))
            if target in gmap:
                return rel_link(dst_rel, gmap[target], frag)
            if target in dir_index:
                return rel_link(dst_rel, dir_index[target], frag)
            if os.path.exists(os.path.join(src, target)) and not target.startswith(".."):
                return github(target, frag)
            fail(f"{g['title']} {src_rel}: link to {url!r} points nowhere")
            return url

        title = guide_title(text)
        body = convert_markdown(text, f"{key}:{src_rel}", dst_rel, None, claims=False, rewrite=rewrite)
        if src_rel == "README.md":
            note = (f'!!! note "The web edition"\n'
                    f"    This guide lives in its [GitHub repository]({repo}), which also holds the setup script, "
                    f"the skills and the example server. This copy matches "
                    + (f"release [{g['tag']}]({repo}/releases/tag/{g['tag']})" if g.get("tag")
                       else f"commit [`{commit[:7]}`]({repo}/tree/{commit})") + ".\n")
            body = re.sub(r"^(# .+\n)", lambda m: m.group(1) + "\n" + note, body, count=1, flags=re.M)
        else:
            body += (f"\n\n---\n\nPart of the [{g['title']}]({rel_link(dst_rel, gmap['README.md'])}). "
                     f"[See this page on GitHub]({github(src_rel)}) to suggest a change.\n{{ .page-source }}\n")
        page_title = title if src_rel == "README.md" else f"{title} · {g['title']}"
        desc = guide_description(text) or f"{title}, from the {g['title']}."
        write(dst_rel, front_matter(title=page_title, description=desc) + body)

    # An index for the checklists folder, which has no README of its own.
    items = []
    for sec_rel, dst in gmap.items():
        if sec_rel.startswith("checklists/"):
            with open(os.path.join(src, sec_rel), encoding="utf-8") as f:
                items.append(f"- [{guide_title(f.read()).replace('Checklist: ', '')}]({posixpath.basename(dst)})")
    write(dir_index["checklists"], front_matter(title=f"Checklists · {g['title']}",
          description="One checklist per phase of building an MCP server, and all of them on one page.")
          + "# Checklists\n\nOne per phase, generated from the guide's pages. Tick them off as you go, or print "
          + "[all of them on one page](all-in-one.md).\n\n" + "\n".join(items) + "\n")

    with open(os.path.join(src, "README.md"), encoding="utf-8") as f:
        m = re.search(r"As of (\d{1,2} \w+ \d{4})", f.read())
    return m.group(1) if m else ""


def main():
    if os.path.isdir(OUT):
        shutil.rmtree(OUT)
    os.makedirs(OUT)
    study_ids = studies()
    pages = page_map(study_ids)
    all_data = {s: load_study(s) for s in study_ids}
    for st, d in all_data.items():
        for c in d['claims']:
            CLAIM_STUDY[c['id']] = st

    # Guides from their own repositories.
    with open(GUIDES_LOCK, encoding="utf-8") as f:
        guides = json.load(f)
    guide_dates = {k: build_guide(k, g) for k, g in guides.items()}

    # Hand-written site pages and assets.
    for base, _, files in os.walk(os.path.join(SITE, "pages")):
        for name in files:
            src = os.path.join(base, name)
            rel = os.path.relpath(src, os.path.join(SITE, "pages")).replace(os.sep, "/")
            text = personalise(open(src, encoding="utf-8").read(), f"site/pages/{rel}")
            for k, d in guide_dates.items():
                text = text.replace("{{" + f"{k.upper()}_GUIDE_DATE" + "}}", f"as of {d}" if d else "")
            write(rel, convert_markdown(text, f"site/pages/{rel}", rel, None) if name.endswith(".md") else text)
    shutil.copytree(os.path.join(SITE, "assets"), os.path.join(OUT, "assets"))

    # Repository pages.
    for src_rel, dst_rel in pages.items():
        if not src_rel.endswith(".md"):
            continue
        study = src_rel.split("/")[1] if src_rel.startswith("studies/") else None
        known = {c["id"] for c in all_data[study]["claims"]} if study else ()
        write(dst_rel, convert_markdown(read(src_rel), src_rel, dst_rel, pages, study, known))

    # Generated pages and data.
    write("claims.md", claims_page(all_data))
    export = {"generated_from": f"{REPO_URL}/tree/{BRANCH}/studies", "studies": {}}
    for s, d in all_data.items():
        faq_rel = f"studies/{s}/faq.yaml"
        if os.path.exists(os.path.join(ROOT, faq_rel)):
            write(pages[faq_rel], faq_page(s, yaml.safe_load(read(faq_rel)), d, pages[faq_rel]))
        export["studies"][s] = {
            "title": d["title"], "checked": str(d.get("checked", "")),
            "sources": d.get("sources"), "references": d.get("references"),
            "claims": [{**c, "url": f"https://research.cafesecurity.com/claims/#{anchor(s, c['id'])}"} for c in d["claims"]],
        }
    write("data/claims.json", json.dumps(export, ensure_ascii=False, indent=1, default=str) + "\n")

    if errors:
        print(f"build_site.py: {len(errors)} problem(s):", file=sys.stderr)
        for e in errors:
            print(f"  - {e}", file=sys.stderr)
        sys.exit(1)
    n = sum(len(d["claims"]) for d in all_data.values())
    who = f"author {AUTHOR['name']}" if AUTHOR else "brand only, no personal name"
    print(f"build_site.py: wrote {OUT} ({len(study_ids)} studies, {n} claims, {len(guides)} guides; {who})")


if __name__ == "__main__":
    main()
