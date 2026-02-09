'use client';

import type { AutoformatRule } from '@platejs/autoformat';

import { AutoformatPlugin } from '@platejs/autoformat';
import { toggleList } from '@platejs/list';
import { KEYS } from 'platejs';
import type { PlateEditor } from 'platejs/react';

const autoformatBlocks: AutoformatRule[] = [
  {
    match: '# ',
    mode: 'block',
    type: KEYS.h1,
  },
  {
    match: '## ',
    mode: 'block',
    type: KEYS.h2,
  },
  {
    match: '### ',
    mode: 'block',
    type: KEYS.h3,
  },
  {
    match: '> ',
    mode: 'block',
    type: KEYS.blockquote,
  },
];

const autoformatLists: AutoformatRule[] = [
  {
    match: ['* ', '- '],
    mode: 'block',
    type: 'list',
    format: (editor: PlateEditor) => {
      toggleList(editor, {
        listStyleType: KEYS.ul,
      });
    },
  },
  {
    match: [String.raw`^\d+\.$ `, String.raw`^\d+\)$ `],
    matchByRegex: true,
    mode: 'block',
    type: 'list',
    format: (editor: PlateEditor, { matchString }: { matchString: string }) => {
      toggleList(editor, {
        listRestartPolite: Number(matchString) || 1,
        listStyleType: KEYS.ol,
      });
    },
  },
  {
    match: ['[] '],
    mode: 'block',
    type: 'list',
    format: (editor: PlateEditor) => {
      toggleList(editor, {
        listStyleType: KEYS.listTodo,
      });
      editor.tf.setNodes({
        checked: false,
        listStyleType: KEYS.listTodo,
      });
    },
  },
  {
    match: ['[x] '],
    mode: 'block',
    type: 'list',
    format: (editor: PlateEditor) => {
      toggleList(editor, {
        listStyleType: KEYS.listTodo,
      });
      editor.tf.setNodes({
        checked: true,
        listStyleType: KEYS.listTodo,
      });
    },
  },
];

export const AutoformatKit = [
  AutoformatPlugin.configure({
    options: {
      enableUndoOnDelete: true,
      rules: [...autoformatBlocks, ...autoformatLists].map((rule) => ({
        ...rule,
        query: (editor: PlateEditor) =>
          !editor.api.some({
            match: { type: editor.getType(KEYS.codeBlock) },
          }),
      })),
    },
  }),
];
