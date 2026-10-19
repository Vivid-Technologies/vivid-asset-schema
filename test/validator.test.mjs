import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateAssetText } from '../lib/asset.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (...p) => readFileSync(path.join(here, ...p), 'utf8');

test('template and valid fixtures pass', () => {
  assert.deepEqual(validateAssetText(read('../templates/asset-repo/ASSET.md')).errors, []);
  const names = readdirSync(path.join(here, 'fixtures/valid'));
  assert.equal(names.length, 3);
  for (const name of names) {
    assert.deepEqual(validateAssetText(read('fixtures/valid', name, 'ASSET.md')).errors, [], name);
  }
});

test('broken fixture fails with specific errors', () => {
  const messages = validateAssetText(read('fixtures/invalid/example-broken-asset/ASSET.md')).errors.map((e) => e.message).join('\n');
  for (const expected of [
    'missing required field "owner"',
    'missing required field "org_requirements"',
    'unknown field "colour"',
    'type: must be one of',
    'sanitized: must be boolean',
    'last_verified: must be a date',
    'cannot depend on itself',
    'missing required section "## How to deploy"',
    'missing required section "## Known gaps"',
    `section "## What's faked or hardcoded" is empty`,
  ]) {
    assert.ok(messages.includes(expected), expected);
  }
});

test('file with no front matter fails', () => {
  assert.match(validateAssetText('# Just a heading\n').errors[0].message, /front matter/);
});

test('field errors point at the field line', () => {
  const { errors } = validateAssetText(read('fixtures/invalid/example-broken-asset/ASSET.md'));
  assert.equal(errors.find((e) => e.message.startsWith('type:')).line, 5);
});
