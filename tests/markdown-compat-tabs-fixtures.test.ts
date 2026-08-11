import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  deserializeMarkdown,
  serializeMarkdown,
  validateValue,
  type TRichEditorMarkdownImportResult,
  type TRichEditorMarkdownSource,
} from '../src/node';

type FixtureCase = {
  expected: string;
  id: string;
  input: string;
  platform: TRichEditorMarkdownSource;
  sourceUrl: string;
  verifiedAt: string;
};

type FixtureManifest = {
  cases: FixtureCase[];
  component: 'tabs';
  contractVersion: 1;
  nodeTypes: ['tabs', 'tab'];
};

const fixtureRoot = fileURLToPath(
  new URL('./fixtures/markdown-compat/tabs/', import.meta.url)
);
const readJson = <T>(path: string): T =>
  JSON.parse(readFileSync(join(fixtureRoot, path), 'utf8')) as T;
const manifest = readJson<FixtureManifest>('manifest.json');

describe('Tabs Markdown compatibility fixture contract', () => {
  it('defines unique, traceable platform cases', () => {
    expect(manifest).toMatchObject({
      component: 'tabs',
      contractVersion: 1,
      nodeTypes: ['tabs', 'tab'],
    });
    expect(new Set(manifest.cases.map(({ id }) => id)).size).toBe(
      manifest.cases.length
    );

    manifest.cases.forEach((fixture) => {
      expect(fixture.sourceUrl).toMatch(/^https:\/\//);
      expect(fixture.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  it.each(manifest.cases)(
    '$id converts source MDX to canonical Tabs data',
    (fixture) => {
      const input = readFileSync(join(fixtureRoot, fixture.input), 'utf8');
      const expected = readJson<TRichEditorMarkdownImportResult>(
        fixture.expected
      );
      const result = deserializeMarkdown(input, { source: fixture.platform });

      expect(result).toEqual(expected);
      expect(validateValue(result.value)).toEqual({
        diagnostics: [],
        valid: true,
      });
    }
  );

  it.each(manifest.cases)(
    '$id round-trips through Groupher portable MDX',
    (fixture) => {
      const expected = readJson<TRichEditorMarkdownImportResult>(
        fixture.expected
      );
      const markdown = serializeMarkdown(expected.value);

      expect(deserializeMarkdown(markdown)).toEqual(expected);
    }
  );
});
