import type { TRichEditorValue } from '../types';

/** Text counts use Unicode code points rather than UTF-16 code units. */
export type TRichEditorDiffStats = Readonly<{
  additions: number;
  deletions: number;
}>;

/**
 * Derived Plate Diff AST. It is render-only and must not be persisted as an
 * editor document.
 */
export type TRichEditorDiffValue = Readonly<{
  kind: 'rich-editor-diff';
  nodes: TRichEditorValue;
}>;

export type TRichEditorDiffResult = Readonly<{
  diffValue: TRichEditorDiffValue;
  hasChanges: boolean;
  stats: TRichEditorDiffStats;
}>;
