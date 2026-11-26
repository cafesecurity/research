#!/usr/bin/env python3
"""Convert a study's Sigma rules to Splunk searches.

Usage: python3 scripts/convert_sigma.py studies/artex-2026-11/indicators
Needs pySigma and pySigma-backend-splunk (pip install pysigma pysigma-backend-splunk).
Writes queries/splunk/<rule>.spl next to the sigma/ folder. The Sentinel (KQL) and Google
Cloud Logging versions are written by hand; see the indicators README.
Licence: MIT. Café Security Research.
"""
import glob
import os
import sys

from sigma.backends.splunk import SplunkBackend
from sigma.collection import SigmaCollection


def main(folder):
    out = os.path.join(folder, "queries", "splunk")
    os.makedirs(out, exist_ok=True)
    for path in sorted(glob.glob(os.path.join(folder, "sigma", "*.yml"))):
        with open(path, encoding="utf-8") as f:
            queries = SplunkBackend().convert(SigmaCollection.from_yaml(f.read()))
        name = os.path.splitext(os.path.basename(path))[0]
        with open(os.path.join(out, name + ".spl"), "w", encoding="utf-8") as f:
            f.write(f"``` Generated from sigma/{name}.yml by scripts/convert_sigma.py. A starting point: tune before use. ```\n")
            f.write(str(queries[-1]).strip() + "\n")
        print("wrote", name)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "studies/artex-2026-11/indicators")
