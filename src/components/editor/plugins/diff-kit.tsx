'use client';

import type { Descendant } from 'platejs';

import {
  type DiffOperation,
  withGetFragmentExcludeDiff,
} from '@platejs/diff';
import { createPlatePlugin } from 'platejs/react';

import { cn } from '@/lib/utils';

import { PersistedEditorKit } from '../persisted-editor-kit';

type TDiffNode = Descendant & {
  children?: TDiffNode[];
  diff?: true;
  diffOperation?: DiffOperation;
  text?: string;
  type?: string;
};

const INVISIBLE_TEXT_PATTERN = /[\u200B-\u200D\u2060\uFEFF]/g;

const isVisuallyEmptyTextNode = (node: TDiffNode): boolean =>
  typeof node.text === 'string' &&
  node.text.replace(INVISIBLE_TEXT_PATTERN, '').trim().length === 0;

export const shouldStyleDiffOperation = (
  node: Descendant | undefined,
  isTextNode: boolean
): boolean => {
  const diffNode = node as TDiffNode | undefined;
  const operation = diffNode?.diffOperation;

  if (!operation) return false;

  return !(
    operation.type === 'update' &&
    !isTextNode &&
    diffNode.type === 'p' &&
    diffNode.children?.every(isVisuallyEmptyTextNode)
  );
};

const diffClassMap: Record<DiffOperation['type'], string> = {
  delete:
    'bg-red-100/70 text-red-950 line-through decoration-red-600 decoration-1 dark:bg-red-950/40 dark:text-red-100',
  insert:
    'bg-emerald-100/80 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-100',
  update:
    'bg-sky-100/80 text-sky-950 dark:bg-sky-950/40 dark:text-sky-100',
};

const diffElementClassMap: Record<DiffOperation['type'], string> = {
  delete:
    '-mx-3 border-l-2 border-red-400 bg-red-50/60 px-3 dark:bg-red-950/20',
  insert:
    '-mx-3 border-l-2 border-emerald-500 bg-emerald-50/60 px-3 dark:bg-emerald-950/20',
  update:
    '-mx-3 border-l-2 border-sky-400 bg-sky-50/60 px-3 dark:bg-sky-950/20',
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
        if (!shouldStyleDiffOperation(node, isTextNode)) return props;

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

export const DiffEditorKit = [...PersistedEditorKit, DiffStylePlugin];
