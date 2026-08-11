'use client';

import { createPlatePlugin } from 'platejs/react';

import { CODE_GROUP_KEYS } from '@/code-group';
import { CodeGroupItemElement } from '@/components/ui/code-group-item-node';
import { CodeGroupElement } from '@/components/ui/code-group-node';

export const CodeGroupKit = [
  createPlatePlugin({
    key: CODE_GROUP_KEYS.group,
    node: { isElement: true },
  }).withComponent(CodeGroupElement),
  createPlatePlugin({
    key: CODE_GROUP_KEYS.item,
    node: { isElement: true },
  }).withComponent(CodeGroupItemElement),
];
