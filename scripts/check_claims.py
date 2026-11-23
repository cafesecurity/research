#!/usr/bin/env python3
"""Check a study's claims against your own copies of the source code.

Each claim in a study's claims.yaml lists its evidence. This script checks every piece of
code evidence it can, using local copies of the pinned sources that you obtained yourself.
It never downloads anything and never runs the code under review.

Usage:
  python3 check_claims.py <claims.yaml> --source KEY=PATH [--source KEY=PATH ...] [--verbose]

KEY is a source key from the claims file (for example artex-v0.3.15); PATH is a git checkout
of that source. Each checkout's HEAD must equal the commit the claims file pins.

Evidence types checked:
  contains      the text appears in the file (within `lines` if given)
  absent        a regular expression does not match the file, the line range, or the tree
  file_exists   a file exists
  file_missing  none of the listed files exist
  differs       files differ between two sources, or exist only in one
  module_hash   Go's module hash of a checkout equals the pinned value
Other types (url, manual) are listed for a person to check.

Exit code: 0 if no checked claim failed, 1 otherwise. Licence: MIT.
"""
import argparse
import fnmatch
import os
import re
import subprocess
import sys

try:
    import yaml
except ImportError:
    raise SystemExit("PyYAML is needed: pip install -r scripts/requirements.txt")

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from verify_module_hash import module_hash  # noqa: E402


def head(path):
    return subprocess.run(["git", "-C", path, "rev-parse", "HEAD"],
                          capture_output=True, text=True, check=True).stdout.strip()


def read_lines(root, rel):
    with open(os.path.join(root, rel), encoding="utf-8", errors="replace") as fh:
        return fh.read().split("\n")


def line_range(spec, n):
    if spec is None:
        return 1, n
    a, _, b = str(spec).partition("-")
    return int(a), int(b or a)


def walk(root, include, exclude):
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d != ".git"]
        for name in filenames:
            rel = os.path.relpath(os.path.join(dirpath, name), root)
            if include and not any(fnmatch.fnmatch(rel, g) for g in include):
                continue
            if any(fnmatch.fnmatch(rel, g) for g in exclude or []):
                continue
            yield rel


def check(ev, roots):
    """Return (state, message): state is 'pass', 'fail', 'skip' or 'manual'."""
    kind = ev["type"]
    if kind in ("url", "manual"):
        return "manual", ev.get("ref") or ev.get("how", "")
    keys = [ev["source"]] if "source" in ev else [ev["a"], ev["b"]]
    missing = [k for k in keys if k not in roots]
    if missing:
        return "skip", f"no local copy of {', '.join(missing)}"
    if kind == "module_hash":
        got = module_hash(roots[ev["source"]], ev["module"], ev["version"])
        return ("pass", got) if got == ev["h1"] else ("fail", f"got {got}")
    if kind == "differs":
        a, b = roots[ev["a"]], roots[ev["b"]]
        bad = []
        for rel in ev["paths"]:
            pa, pb = os.path.join(a, rel), os.path.join(b, rel)
            if os.path.exists(pa) and os.path.exists(pb):
                with open(pa, "rb") as fa, open(pb, "rb") as fb:
                    if fa.read() == fb.read():
                        bad.append(f"{rel} is identical")
            elif not (os.path.exists(pa) or os.path.exists(pb)):
                bad.append(f"{rel} is in neither")
        return ("fail", "; ".join(bad)) if bad else ("pass", f"{len(ev['paths'])} files differ")
    root = roots[ev["source"]]
    if kind == "file_exists":
        gone = [p for p in ev["paths"] if not os.path.exists(os.path.join(root, p))]
        return ("fail", f"missing: {', '.join(gone)}") if gone else ("pass", "all present")
    if kind == "file_missing":
        found = [p for p in ev["paths"] if os.path.exists(os.path.join(root, p))]
        return ("fail", f"found: {', '.join(found)}") if found else ("pass", "none present")
    if kind == "contains":
        lines = read_lines(root, ev["path"])
        a, b = line_range(ev.get("lines"), len(lines))
        text = "\n".join(lines[a - 1:b])
        ok = ev["text"] in text
        return ("pass" if ok else "fail"), f"{ev['path']}:{ev.get('lines', 'any')}"
    if kind == "absent":
        rx = re.compile(ev["pattern"])
        if "path" in ev:
            lines = read_lines(root, ev["path"])
            a, b = line_range(ev.get("lines"), len(lines))
            hits = [f"{ev['path']}:{i}" for i in range(a, b + 1) if rx.search(lines[i - 1])]
        else:
            hits = []
            for rel in walk(root, ev.get("include"), ev.get("exclude")):
                for i, line in enumerate(read_lines(root, rel), 1):
                    if rx.search(line):
                        hits.append(f"{rel}:{i}")
        return ("fail", "found at " + ", ".join(hits[:5])) if hits else ("pass", "no match")
    return "fail", f"unknown evidence type {kind}"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("claims")
    ap.add_argument("--source", action="append", default=[], metavar="KEY=PATH")
    ap.add_argument("--verbose", action="store_true")
    args = ap.parse_args()

    with open(args.claims, encoding="utf-8") as fh:
        data = yaml.safe_load(fh)
    pinned = data["sources"]
    roots = {}
    for item in args.source:
        key, _, path = item.partition("=")
        if key not in pinned:
            raise SystemExit(f"unknown source key {key}; known: {', '.join(pinned)}")
        got = head(path)
        if got != pinned[key]["commit"]:
            raise SystemExit(f"{key}: checkout is at {got}, claims pin {pinned[key]['commit']}")
        roots[key] = path

    totals = {"pass": 0, "fail": 0, "skip": 0, "manual": 0}
    for claim in data["claims"]:
        results = [check(ev, roots) for ev in claim["evidence"]]
        states = {s for s, _ in results}
        if "fail" in states:
            state = "fail"
        elif "pass" in states and not states & {"skip"}:
            state = "pass"
        elif "skip" in states:
            state = "skip"
        else:
            state = "manual"
        totals[state] += 1
        if state == "fail" or args.verbose:
            print(f"{state.upper():6} {claim['id']}  {claim['statement'][:90]}")
            for (s, msg), ev in zip(results, claim["evidence"]):
                if s != "pass" or args.verbose:
                    print(f"         {s:6} {ev['type']}: {msg}")
    print(f"\n{totals['pass']} passed, {totals['fail']} failed, "
          f"{totals['skip']} skipped (no local copy), {totals['manual']} to check by hand")
    return 1 if totals["fail"] else 0


if __name__ == "__main__":
    sys.exit(main())
