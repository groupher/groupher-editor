import { createSlatePlugin } from 'platejs';

import { CODE_GROUP_KEYS } from '@/code-group';
import { CodeGroupItemElementStatic } from '@/components/ui/code-group-item-node-static';
import { CodeGroupElementStatic } from '@/components/ui/code-group-node-static';

export const BaseCodeGroupKit = [
  createSlatePlugin({
    key: CODE_GROUP_KEYS.group,
    node: { isElement: true },
  }).withComponent(CodeGroupElementStatic),
  createSlatePlugin({
    key: CODE_GROUP_KEYS.item,
    node: { isElement: true },
  }).withComponent(CodeGroupItemElementStatic),
];
