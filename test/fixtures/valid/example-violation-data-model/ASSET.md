---
id: example-violation-data-model
name: "Example: Violation Data Model"
summary: EXAMPLE FIXTURE — fictional custom objects for code violations, inspections, and notices.
type: data-model
vertical: [code-enforcement]
platform: [salesforce]
patterns: [case-lifecycle-statuses]
depends_on: []
org_requirements: none
sanitized: true
status: reusable
owner: "@example-owner"
last_verified: 2026-09-15
---

> EXAMPLE FIXTURE — fictional asset used to test vivid-brain. Not a real Vivid asset.

## What it shows

Three custom objects (`Violation__c`, `Inspection__c`, `Notice__c`) with a
status lifecycle from Reported to Closed, plus page layouts and a permission set.

## How to deploy

1. `sf project deploy start --source-dir force-app --target-org <alias>`
2. Assign the `Violation_Admin` permission set.

## What's faked or hardcoded

- Fine amounts are a static picklist, not a fee schedule.

## Known gaps

- No record-level sharing model; everything is org-wide read/write.
