import { createSlatePlugin } from 'platejs';

import { TabElementStatic } from '@/components/ui/tab-node-static';
import { TabsElementStatic } from '@/components/ui/tabs-node-static';
import { TABS_KEYS } from '@/tabs';

export const StaticTabsKit = [
  createSlatePlugin({
    key: TABS_KEYS.group,
    node: { isElement: true },
  }).withComponent(TabsElementStatic),
  createSlatePlugin({
    key: TABS_KEYS.item,
    node: { isElement: true },
  }).withComponent(TabElementStatic),
];
