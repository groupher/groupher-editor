'use client';

import { BulletedListRules, OrderedListRules, TaskListRules } from '@platejs/list';
import { ListPlugin } from '@platejs/list/react';
import { KEYS } from 'platejs';

import { BlockList } from '@/components/ui/block-list';

export const ListKit = [
  ListPlugin.configure({
    inputRules: [
      BulletedListRules.markdown({ variant: '-' }),
      BulletedListRules.markdown({ variant: '*' }),
      OrderedListRules.markdown({ variant: '.' }),
      OrderedListRules.markdown({ variant: ')' }),
      TaskListRules.markdown(),
      TaskListRules.markdown({ checked: true }),
    ],
    inject: {
      targetPlugins: [...KEYS.heading, KEYS.p, KEYS.blockquote, KEYS.toggle],
    },
    render: {
      belowNodes: BlockList,
    },
  }),
];
