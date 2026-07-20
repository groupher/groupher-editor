import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { deserializeMarkdown, validateValue } from '../src/node';

const CALLOUT_COMPONENT = 'callout' as const;
const CALLOUT_CONTRACT_VERSION = 1 as const;
const CANONICAL_CALLOUT_VARIANTS = [
  'note',
  'info',
  'tip',
  'success',
  'warning',
  'danger',
  'important',
  'custom',
] as const;
const CALLOUT_FIXTURE_PLATFORMS = [
  'mintlify',
  'nextra',
  'docusaurus',
  'vitepress',
  'rspress',
  'github',
  'fumadocs',
  'mkdocs-material',
  'gitbook',
  'starlight',
] as const;
const CALLOUT_SYNTAX_FAMILIES = [
  'mdx-jsx',
  'colon-container',
  'github-alert',
  'mkdocs-admonition',
  'liquid-block',
] as const;
const DIAGNOSTIC_SEVERITIES = ['error', 'warning'] as const;

type CalloutVariant = (typeof CANONICAL_CALLOUT_VARIANTS)[number];
type DiagnosticSeverity = (typeof DIAGNOSTIC_SEVERITIES)[number];
type FixturePlatform = (typeof CALLOUT_FIXTURE_PLATFORMS)[number];
type SyntaxFamily = (typeof CALLOUT_SYNTAX_FAMILIES)[number];

type FixtureCase = {
  expected: string;
  id: string;
  input: string;
  platform: FixturePlatform;
  sourceUrl: string;
  supportedBy?: FixturePlatform[];
  syntaxFamily: SyntaxFamily;
  verifiedAt: string;
};

type FixtureManifest = {
  canonicalVariants: CalloutVariant[];
  cases: FixtureCase[];
  component: typeof CALLOUT_COMPONENT;
  contractVersion: typeof CALLOUT_CONTRACT_VERSION;
};

type ExpectedDiagnostic = {
  attribute?: string;
  code: string;
  message: string;
  path: number[];
  severity: DiagnosticSeverity;
};

type ExpectedFixture = {
  diagnostics: ExpectedDiagnostic[];
  value: Array<{
    children: unknown[];
    icon?: string;
    iconLibrary?: 'lucide';
    title?: string;
    type: typeof CALLOUT_COMPONENT;
    variant: CalloutVariant;
  }>;
};

const fixtureRoot = fileURLToPath(
  new URL('./fixtures/markdown-compat/callout/', import.meta.url)
);

const readFixtureJson = <T>(relativePath: string): T =>
  JSON.parse(readFileSync(join(fixtureRoot, relativePath), 'utf8')) as T;

const manifest = readFixtureJson<FixtureManifest>('manifest.json');

describe('Callout Markdown compatibility fixture contract', () => {
  it('defines the canonical callout data boundary', () => {
    expect(manifest).toMatchObject({
      component: CALLOUT_COMPONENT,
      contractVersion: CALLOUT_CONTRACT_VERSION,
    });
    expect(manifest.canonicalVariants).toEqual(CANONICAL_CALLOUT_VARIANTS);
  });

  it('covers the selected platforms and syntax families', () => {
    expect(manifest.cases.map(({ platform }) => platform)).toEqual(
      CALLOUT_FIXTURE_PLATFORMS
    );

    expect(new Set(manifest.cases.map(({ syntaxFamily }) => syntaxFamily))).toEqual(
      new Set(CALLOUT_SYNTAX_FAMILIES)
    );
  });

  it('keeps fixture ids unique', () => {
    const ids = manifest.cases.map(({ id }) => id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(manifest.cases)('$id has valid source and canonical expected data', (fixture) => {
    const input = readFileSync(join(fixtureRoot, fixture.input), 'utf8');
    const expected = readFixtureJson<ExpectedFixture>(fixture.expected);

    expect(input.trim().length).toBeGreaterThan(0);
    expect(fixture.sourceUrl).toMatch(/^https:\/\//);
    expect(fixture.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(expected.diagnostics).toEqual(expect.any(Array));
    expect(validateValue(expected.value)).toEqual({ diagnostics: [], valid: true });

    expected.value.forEach((node) => {
      expect(node.type).toBe(CALLOUT_COMPONENT);
      expect(manifest.canonicalVariants).toContain(node.variant);
      expect(node.children.length).toBeGreaterThan(0);
    });

    expected.diagnostics.forEach((diagnostic) => {
      expect(diagnostic.code.length).toBeGreaterThan(0);
      expect(diagnostic.message.length).toBeGreaterThan(0);
      expect(DIAGNOSTIC_SEVERITIES).toContain(diagnostic.severity);
    });
  });

  it.each(manifest.cases)('$id converts source syntax to canonical Plate data', (fixture) => {
    const input = readFileSync(join(fixtureRoot, fixture.input), 'utf8');
    const expected = readFixtureJson<ExpectedFixture>(fixture.expected);

    expect(deserializeMarkdown(input, { source: fixture.platform })).toEqual(expected);
  });

  it('reports diagnostics at the final Plate node path', () => {
    const result = deserializeMarkdown(
      `Intro paragraph.

<Callout icon="key" color="#FFC107" iconType="regular">
  Custom callout.
</Callout>`,
      { source: 'mintlify' }
    );

    expect(result.value).toEqual([
      {
        children: [{ text: 'Intro paragraph.' }],
        type: 'p',
      },
      {
        children: [{ text: 'Custom callout.' }],
        icon: 'key',
        iconLibrary: 'lucide',
        type: 'callout',
        variant: 'custom',
      },
    ]);
    expect(result.diagnostics.map(({ attribute, path }) => ({ attribute, path }))).toEqual([
      { attribute: 'color', path: [1] },
      { attribute: 'iconType', path: [1] },
    ]);
  });

  it.each(['nextra', 'rspress'] as const)(
    '%s accepts its platform syntax together with GitHub Alerts',
    (source) => {
      const platformCallout =
        source === 'nextra'
          ? '<Callout type="info">Platform callout.</Callout>'
          : `:::info
Platform callout.
:::`;

      expect(
        deserializeMarkdown(
          `${platformCallout}

> [!WARNING]
> Shared GitHub alert.`,
          { source }
        ).value
      ).toEqual([
        {
          children: [{ text: 'Platform callout.' }],
          type: 'callout',
          variant: 'info',
        },
        {
          children: [{ text: 'Shared GitHub alert.' }],
          type: 'callout',
          variant: 'warning',
        },
      ]);
    }
  );
});
