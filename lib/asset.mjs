// Parse and validate ASSET.md files: YAML front matter checked against
// schema/asset.schema.json, plus the required body sections.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { parse as parseYaml } from 'yaml';

const SCHEMA_PATH = fileURLToPath(new URL('../schema/asset.schema.json', import.meta.url));

export const REQUIRED_SECTIONS = [
  'What it shows',
  'How to deploy',
  "What's faked or hardcoded",
  'Known gaps',
];

let validateFrontMatter;
function getSchemaValidator() {
  if (!validateFrontMatter) {
    const ajv = new Ajv2020({ allErrors: true, strict: true });
    addFormats(ajv);
    validateFrontMatter = ajv.compile(JSON.parse(readFileSync(SCHEMA_PATH, 'utf8')));
  }
  return validateFrontMatter;
}

// Normalize headings so "What’s faked or hardcoded" (curly quote) and a
// trailing colon still match.
function normalizeHeading(text) {
  return text.replace(/[‘’]/g, "'").replace(/:\s*$/, '').trim().toLowerCase();
}

// Split ASSET.md into front matter and body. Returns { data, body, bodyStartLine, error }.
export function parseAssetMarkdown(text) {
  const src = text.replace(/^﻿/, '').replace(/\r\n/g, '\n');
  const match = src.match(/^---\n([\s\S]*?)\n---[ \t]*(?:\n|$)/);
  if (!match) {
    return { error: 'ASSET.md must start with YAML front matter between --- lines' };
  }
  let data;
  try {
    data = parseYaml(match[1]);
  } catch (err) {
    return { error: `front matter is not valid YAML: ${err.message.split('\n')[0]}` };
  }
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    return { error: 'front matter must be a YAML mapping' };
  }
  const bodyStartLine = match[0].split('\n').length;
  // Line number of each top-level key, for error messages (+2: the opening --- is line 1).
  const keyLines = {};
  match[1].split('\n').forEach((line, i) => {
    const key = line.match(/^([A-Za-z_][\w-]*)\s*:/);
    if (key && !(key[1] in keyLines)) keyLines[key[1]] = i + 2;
  });
  return { data, body: src.slice(match[0].length), bodyStartLine, keyLines };
}

// Returns a map of normalized "## " heading -> { title, content, line }.
export function extractSections(body, bodyStartLine = 1) {
  const sections = new Map();
  const lines = body.split('\n');
  let current = null;
  let inFence = false;
  lines.forEach((line, i) => {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    const heading = !inFence && line.match(/^##\s+(.+?)\s*#*\s*$/);
    if (heading) {
      current = { title: heading[1], content: [], line: bodyStartLine + i };
      const key = normalizeHeading(heading[1]);
      if (!sections.has(key)) sections.set(key, current);
      return;
    }
    if (current) current.content.push(line);
  });
  for (const section of sections.values()) section.content = section.content.join('\n');
  return sections;
}

function hasRealContent(markdown) {
  return markdown.replace(/<!--[\s\S]*?-->/g, '').trim().length > 0;
}

function formatSchemaError(err) {
  const field = err.instancePath ? err.instancePath.slice(1).replace(/\//g, '.') : '';
  switch (err.keyword) {
    case 'required':
      return `missing required field "${err.params.missingProperty}"`;
    case 'additionalProperties':
      return `unknown field "${err.params.additionalProperty}"`;
    case 'enum':
      return `${field}: must be one of ${err.params.allowedValues.join(', ')}`;
    case 'pattern':
      return `${field}: must be lowercase kebab-case`;
    case 'format':
      return `${field}: must be a ${err.params.format} (YYYY-MM-DD)`;
    default:
      return `${field || 'front matter'}: ${err.message}`;
  }
}

// Salesforce-owned domains whose subdomains identify a specific org or site.
const SF_ORG_HOST = /\b(?:[a-z0-9-]+\.)+(?:salesforce\.com|force\.com|site\.com|salesforce-sites\.com|salesforce-setup\.com|visualforce\.com|cloudforce\.com|database\.com)\b/gi;
// Shared Salesforce hosts that don't identify an org.
const SF_SHARED_HOSTS = new Set([
  'login.salesforce.com', 'test.salesforce.com', 'www.salesforce.com', 'developer.salesforce.com',
  'help.salesforce.com', 'trailhead.salesforce.com', 'appexchange.salesforce.com', 'status.salesforce.com',
  'architect.salesforce.com', 'admin.salesforce.com', 'trust.salesforce.com',
]);
// Hostname labels that are Salesforce plumbing, not an org's name. A host made
// only of these (e.g. "my.salesforce.com" in docs) doesn't identify an org.
const SF_GENERIC_LABELS = new Set(['my', 'lightning', 'sandbox', 'develop', 'scratch', 'trailblaze', 'demo', 'patch', 'free', 'vf', 'file', 'content', 'documentforce', 'site', 'setup', 'builder', 'preview', 'live-preview']);
const SF_BASE = /\.(?:salesforce|force|site|salesforce-sites|salesforce-setup|visualforce|cloudforce|database)\.com$/i;
const isOrgSpecific = (host) => host.toLowerCase().replace(SF_BASE, '').split('.').some((label) => !SF_GENERIC_LABELS.has(label));
const SF_ORG_ID = /\b00D[A-Za-z0-9]{12}(?:[A-Za-z0-9]{3})?\b/g;

// Find Salesforce org URLs/hostnames and org IDs in any text.
// Returns [{ line, match, kind }]. Used by the validator and by repo guards.
export function findOrgReferences(text) {
  const found = [];
  text.replace(/\r\n/g, '\n').split('\n').forEach((line, i) => {
    for (const m of line.matchAll(SF_ORG_HOST)) {
      if (!SF_SHARED_HOSTS.has(m[0].toLowerCase()) && isOrgSpecific(m[0])) found.push({ line: i + 1, match: m[0], kind: 'Salesforce org URL' });
    }
    for (const m of line.matchAll(SF_ORG_ID)) found.push({ line: i + 1, match: m[0], kind: 'Salesforce org ID' });
  });
  return found;
}

function orgReferenceErrors(text) {
  return findOrgReferences(text).map(({ line, match, kind }) => ({
    line,
    message: `${kind} "${match}" is not allowed in ASSET.md. Refer to orgs by alias (e.g. "the fleet demo org"), never by URL or ID`,
  }));
}

// Validate ASSET.md text. Returns { asset, errors } where asset is
// { ...frontMatter, body } when the file parsed.
export function validateAssetText(text) {
  const parsed = parseAssetMarkdown(text);
  if (parsed.error) return { asset: null, errors: [{ line: 1, message: parsed.error }, ...orgReferenceErrors(text)] };

  const { data, body, bodyStartLine, keyLines } = parsed;
  const errors = [];
  const lineOf = (field) => keyLines[field] || 1;

  const schemaCheck = getSchemaValidator();
  if (!schemaCheck(data)) {
    // oneOf failures on org_requirements report each branch; keep one message.
    const seen = new Set();
    for (const err of schemaCheck.errors) {
      if (err.keyword === 'oneOf' || err.instancePath.startsWith('/org_requirements')) {
        const msg = 'org_requirements: must be a non-empty string or a list of strings';
        if (!seen.has(msg)) errors.push({ line: lineOf('org_requirements'), message: msg });
        seen.add(msg);
        continue;
      }
      const msg = formatSchemaError(err);
      const field = err.keyword === 'additionalProperties' ? err.params.additionalProperty : err.instancePath.split('/')[1];
      if (!seen.has(msg)) errors.push({ line: lineOf(field), message: msg });
      seen.add(msg);
    }
  }

  if (Array.isArray(data.depends_on) && data.depends_on.includes(data.id)) {
    errors.push({ line: lineOf('depends_on'), message: 'depends_on: an asset cannot depend on itself' });
  }

  const sections = extractSections(body, bodyStartLine);
  for (const required of REQUIRED_SECTIONS) {
    const section = sections.get(normalizeHeading(required));
    if (!section) {
      errors.push({ line: bodyStartLine, message: `missing required section "## ${required}"` });
    } else if (!hasRealContent(section.content)) {
      errors.push({ line: section.line, message: `section "## ${required}" is empty` });
    }
  }

  errors.push(...orgReferenceErrors(text));

  return { asset: { ...data, body }, errors };
}
