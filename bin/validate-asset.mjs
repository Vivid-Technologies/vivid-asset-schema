#!/usr/bin/env node
// Validate one or more ASSET.md files.
//   npx github:Vivid-Technologies/vivid-asset-schema [path ...]
// A path may be an ASSET.md file or a directory containing one. Defaults to
// ./ASSET.md. Exits 1 if any file is missing or invalid.
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { validateAssetText } from '../lib/asset.mjs';

const inGitHubActions = process.env.GITHUB_ACTIONS === 'true';

function resolveTarget(arg) {
  if (existsSync(arg) && statSync(arg).isDirectory()) return path.join(arg, 'ASSET.md');
  return arg;
}

function report(file, line, message) {
  if (inGitHubActions) {
    // Workflow command: shows as an annotation on the PR.
    console.log(`::error file=${file},line=${line}::${message}`);
  }
  console.error(`${file}:${line}: ${message}`);
}

const args = process.argv.slice(2);
if (args.includes('-h') || args.includes('--help')) {
  console.log('Usage: npx github:Vivid-Technologies/vivid-asset-schema [ASSET.md or directory ...]');
  process.exit(0);
}

const targets = (args.length ? args : ['ASSET.md']).map(resolveTarget);
let failed = 0;

for (const file of targets) {
  if (!existsSync(file)) {
    report(file, 1, 'ASSET.md not found. Every asset repo needs an ASSET.md at its root (template: https://github.com/Vivid-Technologies/vivid-asset-schema/blob/main/templates/asset-repo/ASSET.md).');
    failed++;
    continue;
  }
  const { asset, errors } = validateAssetText(readFileSync(file, 'utf8'));
  if (errors.length) {
    for (const { line, message } of errors) report(file, line, message);
    failed++;
  } else {
    console.log(`ok  ${file} (${asset.id})`);
  }
}

if (failed) {
  console.error(`\n${failed} of ${targets.length} ASSET.md file(s) failed validation.`);
  process.exit(1);
}
