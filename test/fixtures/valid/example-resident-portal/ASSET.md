---
id: example-resident-portal
name: "Example: Resident Complaint Portal"
summary: EXAMPLE FIXTURE — fictional Experience Cloud site for filing and tracking complaints.
type: portal
vertical: [code-enforcement, permitting]
platform: [salesforce, experience-cloud, esri]
patterns: [guest-user-portal, gis-map-embed]
depends_on: [example-violation-data-model, example-hearing-scheduler-lwc]
org_requirements:
  - Experience Cloud (Customer Community) licenses
  - Guest user access enabled
sanitized: false
status: demo-grade
owner: "@example-owner"
last_verified: 2026-07-20
---

> EXAMPLE FIXTURE — fictional asset used to test vivid-brain. Not a real Vivid asset.

## What it shows

A guest-accessible site where a resident drops a pin on a map, files a
complaint, and later checks status and a scheduled hearing.

## How to deploy

1. Deploy the dependencies first (data model, then hearing scheduler).
2. `sf project deploy start --source-dir force-app --target-org <alias>`
3. Publish the site from Setup → Digital Experiences.

## What's faked or hardcoded

- The map uses a public demo basemap, not a client GIS service.
- Complaint categories are hardcoded in the intake LWC.

## Known gaps

- Not yet reviewed for client names (sanitized: false).
- No accessibility audit.
