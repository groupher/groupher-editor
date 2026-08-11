import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  deserializeMarkdown,
  serializeHtmlUnsafe,
  serializeMarkdown,
  validateValue,
} from '../src/node';

type FixtureCase = {
  expected: string;
  id: string;
  input: string;
  platform: 'vitepress';
  sourceUrl: string;
  verifiedAt: string;
};

type FixtureManifest = {
  cases: FixtureCase[];
  component: 'vitepress';
  contractVersion: 1;
};

type ExpectedFixture = ReturnType<typeof deserializeMarkdown>;

const fixtureRoot = fileURLToPath(
  new URL('./fixtures/markdown-compat/vitepress/', import.meta.url)
);
const manifest = JSON.parse(
  readFileSync(join(fixtureRoot, 'manifest.json'), 'utf8')
) as FixtureManifest;

describe('VitePress Markdown compatibility fixtures', () => {
  it.each(manifest.cases)('$id converts the real syntax mix to canonical Plate data', (fixture) => {
    const input = readFileSync(join(fixtureRoot, fixture.input), 'utf8');
    const expected = JSON.parse(
      readFileSync(join(fixtureRoot, fixture.expected), 'utf8')
    ) as ExpectedFixture;
    const result = deserializeMarkdown(input, { source: fixture.platform });

    expect(result).toEqual(expected);
    expect(validateValue(result.value)).toEqual({ diagnostics: [], valid: true });
  });

  it.each(manifest.cases)('$id preserves literal examples and portable round-trips', (fixture) => {
    const input = readFileSync(join(fixtureRoot, fixture.input), 'utf8');
    const result = deserializeMarkdown(input, { source: fixture.platform });
    const inputExample = result.value.find(
      (node) => node.type === 'code_block' && node.lang === 'md'
    );
    const markdown = serializeMarkdown(result.value);

    expect(JSON.stringify(inputExample)).toContain('::: info');
    expect(deserializeMarkdown(markdown)).toEqual(result);
  });

  it.each(manifest.cases)('$id renders accessible code-group controls and every code sample', async (fixture) => {
    const input = readFileSync(join(fixtureRoot, fixture.input), 'utf8');
    const result = deserializeMarkdown(input, { source: fixture.platform });
    const html = await serializeHtmlUnsafe(result.value);
    const text = html.replace(/<[^>]*>/g, '');

    expect(html).toContain('rich-editor-code-group');
    expect(html).toContain('type="radio"');
    expect(html).toContain('>JS</label>');
    expect(html).toContain('>TS</label>');
    expect(html).toContain('data-slate-code-group-index="0"');
    expect(html).toContain('data-slate-code-group-index="1"');
    expect(html).toContain(':checked ~ [data-slate-code-group-index="0"]');
    expect(html).toContain(':checked ~ [data-slate-code-group-index="1"]');
    expect(text).toContain('language: "js"');
    expect(text).toContain('language: "ts"');
  });
});
