# Indicators and detections

Part of the study [ARTEX: what the code says](../README.md). These files turn the study's findings into things a security team can load and use. The [readiness planner](https://research.cafesecurity.com/artex/readiness/) links to them.

**Everything here is a starting point.** The rules were written from the code and from public incident reports. They haven't been tested against real logs, so tune them to your own networks, cloud ranges and baselines before you rely on them.

## What to rely on, in order

1. **Behaviour.** The model writes different commands on every run, and the newest version of ARTEX no longer names itself in web requests (C209). The detections that last are the ones that watch what a credential or an account does.
2. **Logs.** A search is only as good as the logs behind it. Make sure your internal web apps and APIs log requests at all.
3. **Names and fingerprints.** Useful for searching old logs and for finding ARTEX consoles in your own estate, but easy to change.

## Files

| Path | What it is |
| --- | --- |
| [`sigma/`](sigma/) | Detection rules in [Sigma](https://sigmahq.io/), a vendor-neutral format. One rule per alert below, written for Google Cloud, AWS, Microsoft Entra ID (Azure) and web server logs. |
| [`queries/splunk/`](queries/splunk/) | Splunk searches, generated from the Sigma rules by [`scripts/convert_sigma.py`](../../../scripts/convert_sigma.py). |
| [`queries/sentinel-kql/`](queries/sentinel-kql/) | Microsoft Sentinel (KQL) queries. One is generated; the others are hand-written for the named tables. |
| [`queries/google-cloud-logging/`](queries/google-cloud-logging/) | A Google Cloud Logging query for the service-account rule. |
| [`indicators.csv`](indicators.csv) | Names seen in incidents and console fingerprints, each with its source, the claims behind it and a caveat. |
| [`yara/artex.yar`](yara/artex.yar) | YARA rules for finding a copy of ARTEX on systems you manage. |

## How to use them

Whatever you run, do two things first. Replace the placeholder address ranges (`10.0.0.0/8` and `192.0.2.0/24`) with your own office, VPN and cloud egress ranges. Then run each search by hand over the last few weeks before you turn it into an alert, so you can see how often it fires and tune it.

### Splunk

1. Open a search from [`queries/splunk/`](queries/splunk/) and paste the whole file into Search & Reporting. The first line is a comment.
2. Add your own index and source type at the front, for example `index=aws sourcetype=aws:cloudtrail`. The searches leave them out because every Splunk set-up names them differently.
3. Check the field names. They follow each log's own format, so if your add-on renames a field, change the search to match.
4. When the results look right, choose **Save As → Alert** and set a schedule.

### Microsoft Sentinel

1. Open **Logs** in Sentinel, paste a query from [`queries/sentinel-kql/`](queries/sentinel-kql/) and run it.
2. Each query starts with the table it reads: `AWSCloudTrail`, `SigninLogs`, `AADServicePrincipalSignInLogs` or `W3CIISLog`. If Sentinel says the table doesn't exist, turn on the matching data connector.
3. To alert on it, go to **Analytics**, create a **scheduled query rule** and paste the query in.

### Google Cloud

1. Open **Logs Explorer** in the project you want to check, or in a log scope that covers several, and paste [the query](queries/google-cloud-logging/gcp_service_account_key_unexpected_source.txt). Lines starting `--` are comments.
2. The query reads Cloud Audit Logs. Admin Activity logs are always on, but Data Access logs are off by default for most services. Turn them on for the services that hold your data, or the search will only see configuration changes.
3. To alert on it, choose **Actions → Create log alert**.

### Other SIEMs

The rules in [`sigma/`](sigma/) convert to most other query languages with [sigma-cli](https://github.com/SigmaHQ/sigma-cli). For Elasticsearch, for example:

```
pip install "sigma-cli<4"
sigma plugin install elasticsearch
sigma convert -t lucene --without-pipeline sigma/web_request_claims_authorised_test.yml
```

`sigma plugin list` shows the plugins for other SIEMs. The version pin is there because sigma-cli 4.0 couldn't load backend plugins when these steps were tested (26 November 2026). Where a processing pipeline exists for your log source, use it with `-p` in place of `--without-pipeline`, and it will map the field names for you. The failed sign-in rule uses a Sigma correlation, which only some backends can convert.

### The indicators list

[`indicators.csv`](indicators.csv) has one row per indicator, and its `use_for` column says what each is for: user agents for searching past web and API logs, console ports, paths and favicon hashes for scanning your own estate. Load it as a lookup table in Splunk or a watchlist in Sentinel, or search for the values by hand. Read the `caveat` column first, because most of the names only match older builds.

### Scanning with YARA

Install [YARA](https://virustotal.github.io/yara/) and scan a folder:

```
yara -r yara/artex.yar /path/to/scan
```

Each match prints the rule name and the file. A match means a copy of ARTEX is on that system. It doesn't mean you've been attacked (see below).

## The four alerts

| Alert | Rules | Notes |
| --- | --- | --- |
| 1. A machine credential used from outside your own networks and cloud ranges | `gcp_service_account_key_unexpected_source`, `aws_long_term_key_unexpected_source`, `azure_service_principal_unexpected_source` | Bitrise says this one rule matched every stolen-key use in its advisory. Replace the placeholder ranges (`10.0.0.0/8`, `192.0.2.0/24`) with your own. |
| 2. A secret exposed, then any credential used from a new address within the hour | No rule file | This needs two signals joined in your own tooling: a secret-exposure event (a secret-scanning alert, a revealed CI secret, a leaked key notice) and credential use from an address that credential hasn't used before. "New address" needs a baseline of where each credential normally comes from. |
| 3. A burst of failed sign-ins, then a success | `signin_failure_burst` | The Sigma file holds a base rule and a correlation (ten failures in five minutes). The Sentinel version also looks for a success within 30 minutes. |
| 4. Traffic calling itself an authorised test you didn't book | `web_request_claims_authorised_test` | Check every hit against the tests you booked. The tool names in it mainly find older copies and past visits. |

## YARA: what it can and can't do

ARTEX attacks run from the attacker's machines, so YARA won't detect an attack on you. These rules find a copy of ARTEX on systems you're responsible for: installed without permission, left on a compromised host, or part of a red team's kit.

- `ARTEX_Source` matches ARTEX source files and Go module files. Tested against the three ARTEX source copies the study pins (it matched in each, including `go.mod`), against the norma engine on its own (no match) and against five unrelated repositories (no matches, apart from this rule file itself).
- `ARTEX_Binary` looks for compiled ARTEX (ELF, PE or Mach-O) that keeps its module path and two more of its strings. **It hasn't been tested on binaries:** the study builds and runs nothing.
- Forks can rename the module path and strings.

## Not included

- **IP addresses.** ReversingLabs consolidated 3,147 IP indicators from vendor reporting and its own searches (C125). They go stale quickly and belong to their authors, so use the original rather than a copy.
- **Other detection packs.** MalwareMustDie's signature pack and SOC Prime's detections are described in sources [7] and [8] of the teardown.

## Licence

Rules, queries and scripts: MIT. The CSV and this README: CC BY 4.0. Café Security Research.
