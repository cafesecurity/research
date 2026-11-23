#!/usr/bin/env python3
"""Compute Go's module hash ("h1:") for a git checkout and compare it with an expected value.

Go records this hash in go.sum. If the hash of your checkout matches the one a project pins,
you have exactly the module code that project builds against.

The hash is computed the way Go's dirhash.Hash1 does it: for every file in the module,
sorted by name, a line of "<sha256 hex>  <module>@<version>/<path>\n"; then the SHA-256 of
those lines, base64-encoded.

Limits: this lists files with `git ls-files`, which matches Go's module zip only when the
repository has no nested go.mod files, vendor directories or symlinks. The script checks for
those and refuses if it finds any.

Usage:
  python3 verify_module_hash.py <checkout> <module path> <version> [expected h1 hash]

Example:
  python3 verify_module_hash.py ./norma github.com/Autumn-27/norma v0.4.3 \
      h1:DnmOhJPL6OZSMnCVYO5Ujh4yVINuDarEickVi9jx1hI=

Nothing in the checkout is executed. Licence: MIT.
"""
import base64
import hashlib
import subprocess
import sys


def module_hash(checkout: str, module: str, version: str) -> str:
    out = subprocess.run(
        ["git", "-C", checkout, "ls-files", "-s", "-z"], capture_output=True, check=True
    ).stdout.decode()
    entries = [e for e in out.split("\0") if e]
    files = []
    for entry in entries:
        meta, path = entry.split("\t", 1)
        mode = meta.split()[0]
        if mode == "120000":
            raise SystemExit(f"refusing: symlink in tree ({path}); this simple method may not match Go")
        if path.endswith("/go.mod") or "/vendor/" in f"/{path}":
            raise SystemExit(f"refusing: nested module or vendor directory ({path})")
        files.append(path)
    prefix = f"{module}@{version}/"
    lines = []
    for path in sorted(files, key=lambda p: prefix + p):
        with open(f"{checkout}/{path}", "rb") as fh:
            digest = hashlib.sha256(fh.read()).hexdigest()
        lines.append(f"{digest}  {prefix}{path}\n")
    summary = "".join(lines).encode()
    return "h1:" + base64.b64encode(hashlib.sha256(summary).digest()).decode()


def main() -> int:
    if len(sys.argv) not in (4, 5):
        print(__doc__)
        return 2
    checkout, module, version = sys.argv[1:4]
    got = module_hash(checkout, module, version)
    print(got)
    if len(sys.argv) == 5:
        ok = got == sys.argv[4]
        print("MATCH" if ok else f"MISMATCH (expected {sys.argv[4]})")
        return 0 if ok else 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
