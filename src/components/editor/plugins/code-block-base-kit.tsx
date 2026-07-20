import {
  BaseCodeBlockPlugin,
  BaseCodeLinePlugin,
  BaseCodeSyntaxPlugin,
} from '@platejs/code-block';

import { CodeBlockElementStatic } from '@/components/ui/code-block-node-static';
import { CodeLineElementStatic } from '@/components/ui/code-line-node-static';
import { CodeSyntaxLeafStatic } from '@/components/ui/code-syntax-leaf-static';

export const BaseCodeBlockKit = [
  BaseCodeBlockPlugin.configure({
    node: { component: CodeBlockElementStatic },
  }),
  BaseCodeLinePlugin.withComponent(CodeLineElementStatic),
  BaseCodeSyntaxPlugin.withComponent(CodeSyntaxLeafStatic),
];
