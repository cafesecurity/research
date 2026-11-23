# Publication policy

This research is public so it can be checked, challenged and reused. Some security knowledge helps attackers more than defenders, so openness here has one deliberate limit. This page says where it is and why.

## What we publish

- How tools and systems are built: their parts, how they connect, and what controls them.
- Which safety features exist, what their defaults are, and what they leave out.
- Fingerprints and behaviours that help defenders find and detect a tool.
- Provenance: versions, commit hashes, module hashes and how they were verified.
- The method, the evidence for every claim, and every correction.
- Advice for defenders, and for teams who run such tools legitimately.

## What we don't publish

- **The tools themselves.** We never include, mirror or download the software under review. We name sources by repository and commit so researchers can find and verify them.
- **Operating detail.** We describe a tool's instructions to its AI agents in general terms only, not their wording. We don't publish attack settings, payloads, ways around defences or target-selection methods.
- **Step-by-step exploitation** of weaknesses in a tool, beyond what defenders need to recognise and close them.
- **Attribution of attacks** to particular groups or countries unless it's well sourced, and never from indirect clues such as the language of code comments or a developer's time zone.
- **Personal data** about individuals beyond public handles and published authors.

## Grey areas

Where a finding sits close to the line, we publish the defensive version: what a defender should look for or fix, not how to use it. Evidence for such a finding cites a file and line (which anyone with the source can read) rather than reproducing the text. The decision and the reason are recorded in the claim's note.

## Quoting source code

We quote only short fragments, for commentary and to make claims checkable. Quoted code stays under its own licence.

## Weaknesses in legitimate products

If a study finds a vulnerability in a product people rely on, we report it to the vendor first and publish after a reasonable fix period, normally 90 days. Tools built and distributed for attacking others aren't covered by this; their weaknesses are published in their defensive form.

## Use of AI

Studies may use AI assistants for reading, searching and drafting. Each study's methodology says how they were used. The author is responsible for every claim, and code claims are checked by script.

## Changes

Changes to this policy are recorded in the repository's history.
