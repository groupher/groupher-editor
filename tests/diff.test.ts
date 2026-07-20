import type { TElement } from 'platejs';

import { computeDiff } from '@platejs/diff';
import { createSlateEditor } from 'platejs';
import { describe, expect, it, vi } from 'vitest';

import { PersistedEditorKit } from '../src/components/editor/persisted-editor-kit';
import {
  DiffEditorKit,
  getDiffListStyle,
  shouldStyleDiffOperation,
} from '../src/components/editor/plugins/diff-kit';
import {
  computeRichEditorDiff,
  isRichEditorInlineElement,
} from '../src/diff/compute';
import { collectRichEditorDiffMetadata } from '../src/diff/stats';
import { RICH_EDITOR_INLINE_ELEMENT_TYPES } from '../src/schema';
import type { TRichEditorValue } from '../src/types';
import { FULL_VALUE } from './fixtures/full-value';

vi.mock('@platejs/diff', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@platejs/diff')>();

  return {
    ...actual,
    computeDiff: vi.fn(actual.computeDiff),
  };
});

const paragraph = (
  text: string,
  attrs: Record<string, unknown> = {}
): TElement => ({
  type: 'p',
  children: [{ text }],
  ...attrs,
});

const value = (...nodes: TElement[]): TRichEditorValue => nodes;

describe('Rich editor Diff', () => {
  it('returns one reusable result from one Plate Diff calculation', () => {
    vi.mocked(computeDiff).mockClear();

    const result = computeRichEditorDiff(value(paragraph('same')), value(paragraph('same')));

    expect(computeDiff).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      diffValue: {
        kind: 'rich-editor-diff',
        nodes: value(paragraph('same')),
      },
      hasChanges: false,
      stats: { additions: 0, deletions: 0 },
    });
  });

  it.each([
    ['insert', 'a', 'ab', { additions: 1, deletions: 0 }],
    ['delete', 'ab', 'a', { additions: 0, deletions: 1 }],
    ['replace', 'a', 'b', { additions: 1, deletions: 1 }],
    ['emoji code point', '', '🙂', { additions: 1, deletions: 0 }],
  ])('counts %s text using Plate operations', (_, before, after, stats) => {
    expect(computeRichEditorDiff(value(paragraph(before)), value(paragraph(after)))).toMatchObject({
      hasChanges: true,
      stats,
    });
  });

  it.each([
    [value(), value(paragraph(''))],
    [value(), value({ type: 'hr', children: [{ text: '' }] })],
    [
      value(paragraph('same')),
      value({ type: 'p', children: [{ bold: true, text: 'same' }] }),
    ],
    [value(paragraph('same')), value(paragraph('same', { align: 'center' }))],
  ])('detects zero-text changes independently from stats', (before, after) => {
    expect(computeRichEditorDiff(before, after)).toMatchObject({
      hasChanges: true,
      stats: { additions: 0, deletions: 0 },
    });
  });

  it('uses Plate inline semantics for links and mentions', () => {
    const linkBefore = value({
      type: 'p',
      children: [{ type: 'a', url: '/before', children: [{ text: 'same' }] }],
    });
    const linkAfter = value({
      type: 'p',
      children: [{ type: 'a', url: '/after', children: [{ text: 'same' }] }],
    });
    const mentionBefore = value({
      type: 'p',
      children: [
        { type: 'mention', key: 'u-1', value: 'Alice', children: [{ text: '' }] },
      ],
    });
    const mentionAfter = value({
      type: 'p',
      children: [
        { type: 'mention', key: 'u-2', value: 'Bob', children: [{ text: '' }] },
      ],
    });

    expect(computeRichEditorDiff(linkBefore, linkAfter)).toMatchObject({
      hasChanges: true,
      stats: { additions: 4, deletions: 4 },
    });
    expect(computeRichEditorDiff(mentionBefore, mentionAfter)).toMatchObject({
      hasChanges: true,
      stats: { additions: 0, deletions: 0 },
    });
  });

  it('counts a block reorder as delete plus insert', () => {
    const before = value(paragraph('A', { id: 'a' }), paragraph('B', { id: 'b' }));
    const after = value(paragraph('B', { id: 'b' }), paragraph('A', { id: 'a' }));

    expect(computeRichEditorDiff(before, after)).toMatchObject({
      hasChanges: true,
      stats: { additions: 1, deletions: 1 },
    });
  });

  it('continues through update nodes to count nested text operations', () => {
    expect(
      collectRichEditorDiffMetadata([
        {
          type: 'p',
          diff: true,
          diffOperation: {
            newProperties: { align: 'center' },
            properties: {},
            type: 'update',
          },
          children: [
            { text: '🙂', diff: true, diffOperation: { type: 'insert' } },
          ],
        },
      ] as TRichEditorValue)
    ).toEqual({
      hasChanges: true,
      stats: { additions: 1, deletions: 0 },
    });
  });

  it('does not double-count nested operations inside inserted subtrees', () => {
    expect(
      collectRichEditorDiffMetadata([
        {
          type: 'p',
          diff: true,
          diffOperation: { type: 'insert' },
          children: [
            { text: 'new', diff: true, diffOperation: { type: 'insert' } },
          ],
        },
      ] as TRichEditorValue)
    ).toEqual({
      hasChanges: true,
      stats: { additions: 3, deletions: 0 },
    });
  });

  it('does not mutate either input document', () => {
    const before = structuredClone(FULL_VALUE);
    const after = structuredClone(FULL_VALUE);
    after[0].children = [{ text: '发布流程更新' }];
    const beforeSnapshot = structuredClone(before);
    const afterSnapshot = structuredClone(after);

    expect(computeRichEditorDiff(before, after).hasChanges).toBe(true);
    expect(before).toEqual(beforeSnapshot);
    expect(after).toEqual(afterSnapshot);
  });
});

describe('Diff inline schema contract', () => {
  it('uses the first list level as the diff-view baseline', () => {
    expect(
      getDiffListStyle(
        paragraph('top-level', { indent: 1, listStyleType: 'disc' })
      )
    ).toEqual({
      marginLeft: undefined,
      paddingLeft: '1.5rem',
    });
    expect(
      getDiffListStyle(
        paragraph('nested', { indent: 2, listStyleType: 'decimal' })
      )
    ).toEqual({
      marginLeft: undefined,
      paddingLeft: 'calc(1.5rem + 40px)',
    });
  });

  it('leaves non-list block indentation to the persisted editor kit', () => {
    expect(getDiffListStyle(paragraph('indented', { indent: 1 }))).toBeUndefined();
  });

  it('does not style visually empty paragraph updates', () => {
    const updateOperation = {
      diff: true as const,
      diffOperation: { type: 'update' as const },
      type: 'p',
    };

    expect(
      shouldStyleDiffOperation(
        { ...updateOperation, children: [{ text: '' }] },
        false
      )
    ).toBe(false);
    expect(
      shouldStyleDiffOperation(
        { ...updateOperation, children: [{ text: '\uFEFF' }] },
        false
      )
    ).toBe(false);
    expect(
      shouldStyleDiffOperation(
        { ...updateOperation, children: [{ text: 'visible' }] },
        false
      )
    ).toBe(true);
    expect(
      shouldStyleDiffOperation(
        {
          ...updateOperation,
          children: [
            {
              children: [{ text: '' }],
              key: 'u-1',
              type: 'mention',
              value: 'Alice',
            },
          ],
        },
        false
      )
    ).toBe(true);
  });

  it('matches the browser editor classifier', () => {
    const editor = createSlateEditor({ plugins: PersistedEditorKit, value: [] });
    const inlineNodes: Record<string, TElement> = {
      a: { type: 'a', url: '/', children: [{ text: '' }] },
      mention: {
        type: 'mention',
        key: 'u-1',
        value: 'Alice',
        children: [{ text: '' }],
      },
    };

    RICH_EDITOR_INLINE_ELEMENT_TYPES.forEach((type) => {
      const node = inlineNodes[type];

      expect(editor.api.isInline(node), `browser inline ${type}`).toBe(true);
      expect(isRichEditorInlineElement(node), `Diff inline ${type}`).toBe(true);
    });

    const paragraphNode = paragraph('block');
    expect(editor.api.isInline(paragraphNode)).toBe(false);
    expect(isRichEditorInlineElement(paragraphNode)).toBe(false);
  });

  it('keeps optional editing kits out of the read-only renderer', () => {
    const pluginKeys = new Set(DiffEditorKit.map((plugin) => plugin.key));

    expect(pluginKeys.has('diffStyle')).toBe(true);
    expect(pluginKeys.has('markdown')).toBe(false);
    expect(pluginKeys.has('emoji_input')).toBe(false);
    expect(pluginKeys.has('mention_input')).toBe(false);
    expect(pluginKeys.has('slash_input')).toBe(false);
  });
});
