---
title: "AI pentest agent readiness planner"
description: "A free, private planner for defending against AI pentest agents such as ARTEX: four workstreams your teams can run in parallel, a board answer that updates as you go, and exports to PDF, Excel, CSV, Markdown and calendar."
hide:
  - toc
---

# AI pentest agent readiness planner

AI pentest agents such as ARTEX get in through old credentials and forgotten systems, move within minutes, and change how they look from one version to the next. This planner turns the defences that matter most into a plan your teams can work through in parallel: four workstreams, each with an owner, a status and a date, and a two-sentence answer for your board that updates as the work gets done.

The workstreams don't depend on each other, so all four can start at once. If you can only take on one at a time, follow the numbers: they're our judgement of which controls would have stopped or caught the most of the incidents behind [the ARTEX study](index.md). ARTEX is the worked example, but nothing here depends on the tool's name.

!!! note "Private by design"
    Nothing you type here leaves your browser. The plan is saved in this browser only, so export a backup if you'll want it on another device. A share link carries the plan in the part after `#`, which browsers don't send to any server, but anyone you give the link to can read it.

<div id="planner" class="cs-planner" markdown="0">
<noscript>
<p>The planner needs JavaScript. Without it, here are the four workstreams in priority order:</p>
<ol>
<li><strong>Machine credentials</strong> (platform team): list long-lived machine credentials; replace the riskiest with short-lived ones tied to the workload; limit the rest; protect build secrets; find and rotate exposed secrets.</li>
<li><strong>Detection</strong> (security operations): make sure internal apps log requests; alert on a credential used from outside your ranges, on a secret exposed then used from a new address, on a burst of failed sign-ins then a success, and on traffic calling itself an authorised test you didn't book.</li>
<li><strong>Accounts and exposure</strong> (identity and infrastructure): switch off dormant, test and supplier accounts; revoke former suppliers' keys; two-factor everywhere; take admin consoles and build systems off the open internet; close forgotten endpoints.</li>
<li><strong>Data leaving, and the night it goes wrong</strong> (architecture and incident response): egress allow-lists; rate limits on bulk export; log who reads secrets; a revocation runbook for each important key.</li>
</ol>
</noscript>
</div>

## Watch behaviour, not names

The newest version of ARTEX, v0.3.30, stopped naming itself in web requests: it now sends ordinary browser user agents and tells its agents to copy the target's own headers (C209). Tool names in your logs will find older copies and past visits, not the next attack (C210). Whatever the next version calls itself, it still needs a credential that works and a system nobody's watching, which is what the four alerts look for.

## Detection rules and indicators

The detection workstream links to [rules and indicators](indicators/index.md) you can load: Sigma rules for the alerts, with Splunk, Microsoft Sentinel and Google Cloud versions; names seen in incidents and console fingerprints, each with its source; and YARA rules for finding a copy of ARTEX on your own systems. They're starting points, written from the code and from public incident reports, so tune them before you rely on them.

## Exports

- **Print or save as PDF:** a clean report of the whole plan, for a meeting or a Teams channel.
- **Excel (.xlsx) and CSV:** the plan as a table. Both open in Google Sheets (File, then Import). Edit owners, statuses, dates and notes there, then bring the CSV back with **Import** to update the planner.
- **Copy as a table:** paste straight into Google Sheets or Excel.
- **Markdown:** for a wiki, a ticket or a pull request.
- **Calendar (.ics):** each open task with a due date, plus the target date, as all-day events.
- **Back up (.json):** everything, including tasks you've added. Import it on another device or browser to carry on.

When this page is updated, your saved plan keeps its owners, statuses, dates and notes for every task that's still in the plan.

<small>The planner's code is in the [research repository](repo:site/assets/javascripts/readiness.js) (MIT licence).</small>
