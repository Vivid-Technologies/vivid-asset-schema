// Guard: this repo is public, so no tracked file may contain a Salesforce org
// URL or org ID.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findOrgReferences } from '../lib/asset.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Tests that deliberately contain fake org URLs to prove the rule works.
const ALLOWED = new Set(['test/validator.test.mjs']);

test('no tracked file contains a Salesforce org URL or org ID', () => {
  const files = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean);
  const hits = [];
  for (const file of files) {
    if (ALLOWED.has(file) || file === 'package-lock.json') continue;
    for (const ref of findOrgReferences(readFileSync(path.join(root, file), 'utf8'))) {
      hits.push(`${file}:${ref.line} ${ref.kind}: ${ref.match}`);
    }
  }
  assert.deepEqual(hits, []);
});
