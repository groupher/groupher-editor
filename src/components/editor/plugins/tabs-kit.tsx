'use client';

import { createPlatePlugin } from 'platejs/react';

import { TabElement } from '@/components/ui/tab-node';
import { TabsElement } from '@/components/ui/tabs-node';
import { TABS_KEYS } from '@/tabs';

export const TabsKit = [
  createPlatePlugin({
    key: TABS_KEYS.group,
    node: { isElement: true },
  }).withComponent(TabsElement),
  createPlatePlugin({
    key: TABS_KEYS.item,
    node: { isElement: true },
  }).withComponent(TabElement),
];
