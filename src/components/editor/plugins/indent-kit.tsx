'use client';

import { IndentPlugin } from '@platejs/indent/react';
import { KEYS } from 'platejs';

export const RICH_EDITOR_INDENT_OFFSET = 40;

export const IndentKit = [
  IndentPlugin.configure({
    inject: {
      targetPlugins: [...KEYS.heading, KEYS.p, KEYS.blockquote, KEYS.toggle],
    },
    options: {
      offset: RICH_EDITOR_INDENT_OFFSET,
    },
  }),
];
