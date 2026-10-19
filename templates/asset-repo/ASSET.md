---
# EXAMPLE — replace every value. Schema: https://github.com/Vivid-Technologies/vivid-asset-schema
id: example-permit-fee-calculator        # kebab-case, unique across the catalog
name: "Example: Permit Fee Calculator"
summary: One line on what this is and why you'd reuse it.
type: lwc                                # demo | lwc | portal | website | data-model | integration
vertical: [permitting]                   # e.g. courts, code-enforcement, permitting, licensing
platform: [salesforce]                   # e.g. salesforce, experience-cloud, mulesoft, esri, box
patterns: [fee-schedule-lookup]          # optional: reusable patterns this demonstrates
depends_on: []                           # ids of other assets this needs
org_requirements: none                   # string, or a list of licenses/features/settings
sanitized: false                         # a person sets true after reviewing for client data
status: demo-grade                       # demo-grade | reusable | packaged
owner: "@your-github-handle"
last_verified: 2026-10-19                # date it was last deployed and checked
---

> EXAMPLE — this file shows the format. Replace the content below.

## What it shows

What a viewer sees in a demo, and the business problem it answers. Two to
five sentences.

## How to deploy

1. Deploy anything in `depends_on` first.
2. `sf project deploy start --source-dir force-app --target-org <alias>`
3. Post-deploy steps: permission sets, data loads, site publishing.

## What's faked or hardcoded

- Anything a client would assume is real but isn't: sample data, stubbed
  callouts, hardcoded record IDs, demo-only credentials or endpoints.

## Known gaps

- What doesn't work yet, what was never tested, and what a real project
  would need to add.
