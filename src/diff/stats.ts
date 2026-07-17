import type { Descendant } from 'platejs';

import type { DiffOperation } from '@platejs/diff';

import type { TRichEditorValue } from '../types';
import type { TRichEditorDiffStats } from './types';

type TDiffNode = Descendant & {
  children?: TDiffNode[];
  diffOperation?: DiffOperation;
  text?: string;
};

type TRichEditorDiffMetadata = Readonly<{
  hasChanges: boolean;
  stats: TRichEditorDiffStats;
}>;

const countTextCodePoints = (node: TDiffNode): number => {
  if (typeof node.text === 'string') return Array.from(node.text).length;

  return node.children?.reduce((sum, child) => sum + countTextCodePoints(child), 0) ?? 0;
};

export const collectRichEditorDiffMetadata = (
  nodes: TRichEditorValue
): TRichEditorDiffMetadata => {
  const stats = { additions: 0, deletions: 0 };
  let hasChanges = false;

  const visit = (diffNodes: TDiffNode[]) => {
    for (const node of diffNodes) {
      const operation = node.diffOperation?.type;

      if (operation === 'insert') {
        hasChanges = true;
        stats.additions += countTextCodePoints(node);
        continue;
      }

      if (operation === 'delete') {
        hasChanges = true;
        stats.deletions += countTextCodePoints(node);
        continue;
      }

      if (operation === 'update') {
        hasChanges = true;
      }

      if (node.children) visit(node.children);
    }
  };

  visit(nodes as TDiffNode[]);

  return { hasChanges, stats };
};
