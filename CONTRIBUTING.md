# Contributing

Scrutiny is the point of publishing this research openly. If you think a claim is wrong, unclear or missing evidence, please say so.

## Ways to help

- **Challenge a claim.** Open an issue with the claim ID (for example `artex-2026-11#C083`), what you think is wrong, and your evidence.
- **Add evidence.** Primary sources, other versions or forks, test results.
- **Report a mistake** in a report, a script or the method.
- **Reproduce the checks** and tell us if anything fails. Include your Python version and how you got your copies of the sources.

Use the issue forms; they ask for what we need.

## Not in public

If your evidence would help someone attack others (operating detail, a working bypass, a weakness in a live system), don't put it in an issue. Use the private route in [SECURITY.md](SECURITY.md).

## Pull requests

Welcome for typos, broken links, script fixes and new evidence. If a change alters what a claim says:

1. Edit the claim in `claims.yaml` and keep its ID. Never reuse an ID for a different finding.
2. Add a row to the study's `CORRECTIONS.md`.
3. Run `scripts/check_claims.py` if you have the sources, and say so in the pull request.
4. Follow the [publication policy](PUBLICATION_POLICY.md).

## Style

British English and plain language. A claim is one checkable statement. Say how sure we are by its status, not with hedging words.

## Licence of contributions

By contributing you agree that text and data you add are licensed under CC BY 4.0 and code under MIT, as in [LICENSE.md](LICENSE.md).

## Conduct

Be specific, be civil, and criticise claims rather than people.
