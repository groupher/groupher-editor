import {
  BaseCodeBlockPlugin,
  BaseCodeLinePlugin,
  BaseCodeSyntaxPlugin,
} from '@platejs/code-block';

import { codeBlockLowlight } from '@/code-block-lowlight';
import { CodeBlockElementStatic } from '@/components/ui/code-block-node-static';
import { CodeLineElementStatic } from '@/components/ui/code-line-node-static';
import { CodeSyntaxLeafStatic } from '@/components/ui/code-syntax-leaf-static';

export const StaticCodeBlockKit = [
  BaseCodeBlockPlugin.configure({
    node: { component: CodeBlockElementStatic },
    options: { lowlight: codeBlockLowlight },
  }),
  BaseCodeLinePlugin.withComponent(CodeLineElementStatic),
  BaseCodeSyntaxPlugin.withComponent(CodeSyntaxLeafStatic),
];
