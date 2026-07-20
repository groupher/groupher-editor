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

const ACCORDION_COMPONENT = 'accordion_group' as const;
const ACCORDION_CONTRACT_VERSION = 1 as const;
const ACCORDION_NODE_TYPES = [
  'accordion_group',
  'accordion',
  'accordion_title',
  'accordion_content',
] as const;
const ACCORDION_SYNTAX_FAMILIES = ['mdx-jsx', 'html-details'] as const;

type FixtureCase = {
  expected: string;
  id: string;
  input: string;
  platform: 'groupher' | 'mintlify';
  sourceUrl: string;
  syntaxFamily: (typeof ACCORDION_SYNTAX_FAMILIES)[number];
  verifiedAt: string;
};

type FixtureManifest = {
  cases: FixtureCase[];
  component: typeof ACCORDION_COMPONENT;
  contractVersion: typeof ACCORDION_CONTRACT_VERSION;
  nodeTypes: string[];
};

type ExpectedFixture = ReturnType<typeof deserializeMarkdown>;

const fixtureRoot = fileURLToPath(
  new URL('./fixtures/markdown-compat/accordion/', import.meta.url)
);

const readFixtureJson = <T>(relativePath: string): T =>
  JSON.parse(readFileSync(join(fixtureRoot, relativePath), 'utf8')) as T;

const manifest = readFixtureJson<FixtureManifest>('manifest.json');

describe('Accordion Markdown compatibility fixture contract', () => {
  it('defines the source-independent Accordion data boundary', () => {
    expect(manifest).toMatchObject({
      component: ACCORDION_COMPONENT,
      contractVersion: ACCORDION_CONTRACT_VERSION,
      nodeTypes: ACCORDION_NODE_TYPES,
    });
    expect(new Set(manifest.cases.map(({ syntaxFamily }) => syntaxFamily))).toEqual(
      new Set(ACCORDION_SYNTAX_FAMILIES)
    );
  });

  it('keeps fixture ids unique and expected values valid', () => {
    const ids = manifest.cases.map(({ id }) => id);

    expect(new Set(ids).size).toBe(ids.length);

    manifest.cases.forEach((fixture) => {
      const input = readFileSync(join(fixtureRoot, fixture.input), 'utf8');
      const expected = readFixtureJson<ExpectedFixture>(fixture.expected);

      expect(input.trim().length).toBeGreaterThan(0);
      expect(fixture.sourceUrl).toMatch(/^https:\/\//);
      expect(fixture.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(validateValue(expected.value)).toEqual({ diagnostics: [], valid: true });
      expect(expected.value[0]).toMatchObject({ type: ACCORDION_COMPONENT });
    });
  });

  it.each(manifest.cases)('$id converts source syntax to canonical Plate data', (fixture) => {
    const input = readFileSync(join(fixtureRoot, fixture.input), 'utf8');
    const expected = readFixtureJson<ExpectedFixture>(fixture.expected);

    expect(deserializeMarkdown(input, { source: fixture.platform })).toEqual(expected);
  });

  it.each(manifest.cases)('$id round-trips through portable Markdown', (fixture) => {
    const expected = readFixtureJson<ExpectedFixture>(fixture.expected);
    const markdown = serializeMarkdown(expected.value);

    expect(deserializeMarkdown(markdown)).toEqual(expected);
  });

  it('wraps a standalone Accordion and details element in implicit groups', () => {
    const named = deserializeMarkdown(
      '<Accordion title="Standalone">Body.</Accordion>'
    ).value;
    const details = deserializeMarkdown(
      '<details><summary>Standalone</summary>Body.</details>'
    ).value;

    expect(named).toEqual(details);
    expect(named).toEqual([
      expect.objectContaining({
        children: expect.arrayContaining([
          expect.objectContaining({
            children: expect.arrayContaining([
              {
                children: [{ text: 'Standalone' }],
                type: 'accordion_title',
              },
            ]),
            type: 'accordion',
          }),
        ]),
        type: 'accordion_group',
      }),
    ]);
  });

  it('renders the canonical hierarchy as native details and summary HTML', async () => {
    const expected = readFixtureJson<ExpectedFixture>(
      'expected/html-details.json'
    );
    const html = await serializeHtmlUnsafe(expected.value);

    expect(html).toContain('class="slate-accordion_group');
    expect(html).toContain('<details');
    expect(html).toContain('<summary');
    expect(html).toContain('First answer.');
  });
});
