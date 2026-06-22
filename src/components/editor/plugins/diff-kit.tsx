'use client';

import type { Descendant } from 'platejs';

import {
  computeDiff,
  type DiffOperation,
  withGetFragmentExcludeDiff,
} from '@platejs/diff';
import { createPlatePlugin } from 'platejs/react';

import { cn } from '@/lib/utils';

import { EditorKit } from '../editor-kit';

type TDiffNode = Descendant & {
  children?: TDiffNode[];
  diff?: true;
  diffOperation?: DiffOperation;
  text?: string;
};

export type TRichEditorDiffStats = {
  additions: number;
  deletions: number;
};

const diffClassMap: Record<DiffOperation['type'], string> = {
  delete:
    'bg-red-100/70 text-red-950 line-through decoration-red-600 decoration-2 dark:bg-red-950/40 dark:text-red-100',
  insert:
    'bg-emerald-100/80 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-100',
  update:
    'bg-sky-100/80 text-sky-950 dark:bg-sky-950/40 dark:text-sky-100',
};

const diffElementClassMap: Record<DiffOperation['type'], string> = {
  delete:
    'border-l-2 border-red-400 pl-2 -ml-3 bg-red-50/60 dark:bg-red-950/20',
  insert:
    'border-l-2 border-emerald-500 pl-2 -ml-3 bg-emerald-50/60 dark:bg-emerald-950/20',
  update:
    'border-l-2 border-sky-400 pl-2 -ml-3 bg-sky-50/60 dark:bg-sky-950/20',
};

const DiffStylePlugin = createPlatePlugin({
  key: 'diffStyle',
  inject: {
    nodeProps: {
      transformProps: ({ element, props, text }) => {
        const node = (element ?? text) as TDiffNode | undefined;
        const operation = node?.diffOperation;

        if (!operation) return props;

        const isTextNode = text !== undefined;
        const operationClass = isTextNode
          ? diffClassMap[operation.type]
          : diffElementClassMap[operation.type];

        return {
          ...props,
          className: cn(props.className, operationClass),
          'data-rich-editor-diff': operation.type,
        };
      },
    },
  },
}).overrideEditor(withGetFragmentExcludeDiff);

export const DiffEditorKit = [...EditorKit, DiffStylePlugin];

export const computeRichEditorDiffValue = (
  previousValue: Descendant[],
  currentValue: Descendant[],
): Descendant[] => computeDiff(previousValue, currentValue);

const countTextLength = (node: TDiffNode): number => {
  if (typeof node.text === 'string') return node.text.length;

  return node.children?.reduce((sum, child) => sum + countTextLength(child), 0) ?? 0;
};

const collectDiffStats = (
  nodes: TDiffNode[],
  stats: TRichEditorDiffStats,
): TRichEditorDiffStats => {
  for (const node of nodes) {
    if (node.diffOperation?.type === 'insert') {
      stats.additions += countTextLength(node);
      continue;
    }

    if (node.diffOperation?.type === 'delete') {
      stats.deletions += countTextLength(node);
      continue;
    }

    if (node.children) {
      collectDiffStats(node.children, stats);
    }
  }

  return stats;
};

export const computeRichEditorDiffStats = (
  previousValue: Descendant[],
  currentValue: Descendant[],
): TRichEditorDiffStats => {
  const diffValue = computeRichEditorDiffValue(previousValue, currentValue) as TDiffNode[];

  return collectDiffStats(diffValue, { additions: 0, deletions: 0 });
};
