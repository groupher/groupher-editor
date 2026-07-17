import type { Descendant } from 'platejs';

import { computeDiff } from '@platejs/diff';

import { collectRichEditorDiffMetadata } from './stats';
import type { TRichEditorDiffResult } from './types';
import { RICH_EDITOR_INLINE_ELEMENT_TYPES } from '../schema';
import type { TRichEditorValue } from '../types';

const inlineElementTypes = new Set<string>(RICH_EDITOR_INLINE_ELEMENT_TYPES);

export const isRichEditorInlineElement = (node: Descendant): boolean =>
  'type' in node &&
  typeof node.type === 'string' &&
  inlineElementTypes.has(node.type);

export const computeRichEditorDiff = (
  before: TRichEditorValue,
  after: TRichEditorValue
): TRichEditorDiffResult => {
  const nodes = computeDiff(before, after, {
    isInline: isRichEditorInlineElement,
    lineBreakChar: '¶',
  }) as TRichEditorValue;
  const metadata = collectRichEditorDiffMetadata(nodes);

  return {
    diffValue: {
      kind: 'rich-editor-diff',
      nodes,
    },
    ...metadata,
  };
};
