# vivid-asset-schema

The `ASSET.md` contract for VividGovTech asset repos: the schema, a validator,
and a reusable GitHub Actions check. This repo is public so asset repos can run
the check without secrets. It contains no assets and no client information.
The catalog itself is private.

## Add the check to an asset repo

1. Copy [`templates/asset-repo/ASSET.md`](templates/asset-repo/ASSET.md) to the
   repo root and fill it in. Leave `sanitized: false` until a person has reviewed the repo.
2. Copy [`templates/asset-repo/.github/workflows/asset.yml`](templates/asset-repo/.github/workflows/asset.yml)
   to `.github/workflows/asset.yml`.

Every PR then runs **ASSET.md / validate**, which fails if `ASSET.md` is missing
or invalid. To pin a schema version, pass `with: { schema-ref: v1.0.0 }`.

## Validate locally

```bash
npx github:Vivid-Technologies/vivid-asset-schema            # ./ASSET.md
npx github:Vivid-Technologies/vivid-asset-schema path/to/repo
```

## Format

YAML front matter, then Markdown. Full rules: [`schema/asset.schema.json`](schema/asset.schema.json).
Unknown fields are rejected.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | kebab-case string | Unique across the catalog |
| `name` | string | |
| `summary` | string | One line |
| `type` | enum | `demo`, `lwc`, `portal`, `website`, `data-model`, `integration` |
| `vertical` | list, ≥1 | e.g. `courts`, `code-enforcement`, `permitting`, `licensing` |
| `platform` | list, ≥1 | e.g. `salesforce`, `experience-cloud`, `mulesoft`, `esri`, `box` |
| `patterns` | list, optional | Reusable patterns the asset shows |
| `depends_on` | list of ids | `[]` if none |
| `org_requirements` | string or list | `none` if none |
| `sanitized` | boolean | Only a person sets `true`, after review |
| `status` | enum | `demo-grade`, `reusable`, `packaged` |
| `owner` | string | GitHub handle |
| `last_verified` | date | `YYYY-MM-DD` |

Required body sections, each non-empty: `## What it shows`, `## How to deploy`,
`## What's faked or hardcoded`, `## Known gaps`.

## Develop

```bash
npm ci && npm test
```

Schema changes affect every asset repo the next time it runs the check. Coordinate
them with the catalog maintainers, and tag a release (`vX.Y.Z`) for anything breaking.
