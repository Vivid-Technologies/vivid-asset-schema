---
id: example-hearing-scheduler-lwc
name: "Example: Hearing Scheduler LWC"
summary: EXAMPLE FIXTURE — fictional calendar component for booking hearing slots.
type: lwc
vertical: [courts, code-enforcement]
platform: [salesforce, experience-cloud]
patterns: [slot-booking-calendar]
depends_on: []
org_requirements:
  - Lightning Experience enabled
  - Experience Cloud license if exposed to guests
sanitized: true
status: demo-grade
owner: "@example-owner"
last_verified: 2026-08-01
---

> EXAMPLE FIXTURE — fictional asset used to test vivid-brain. Not a real Vivid asset.

## What it shows

A week-view LWC that lists open hearing slots and books one against a record.

## How to deploy

Deploy `force-app/main/default/lwc/hearingScheduler` and its Apex controller,
then drop the component on any record page.

## What's faked or hardcoded

- Slots are generated in Apex from a fixed 9–5 weekday template.
- Courtroom names are hardcoded in the controller.

## Known gaps

- No time-zone handling for guests outside the org's zone.
- No Jest tests.
