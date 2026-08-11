'use client';

import { CodeBlockRules } from '@platejs/code-block';
import {
  CodeBlockPlugin,
  CodeLinePlugin,
  CodeSyntaxPlugin,
} from '@platejs/code-block/react';

import { codeBlockLowlight } from '@/code-block-lowlight';
import { CodeBlockElement } from '@/components/ui/code-block-node';
import { CodeLineElement } from '@/components/ui/code-line-node';
import { CodeSyntaxLeaf } from '@/components/ui/code-syntax-leaf';

export const CodeBlockKit = [
  CodeBlockPlugin.configure({
    inputRules: [CodeBlockRules.markdown({ on: 'match' })],
    node: { component: CodeBlockElement },
    options: { lowlight: codeBlockLowlight },
    shortcuts: { toggle: { keys: 'mod+alt+8' } },
  }),
  CodeLinePlugin.withComponent(CodeLineElement),
  CodeSyntaxPlugin.withComponent(CodeSyntaxLeaf),
];
