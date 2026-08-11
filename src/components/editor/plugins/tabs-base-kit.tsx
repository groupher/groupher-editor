import { createSlatePlugin } from 'platejs';

import { TabElementHtml } from '@/components/ui/tab-node-html';
import { TabsElementHtml } from '@/components/ui/tabs-node-html';
import { TABS_KEYS } from '@/tabs';

export const BaseTabsKit = [
  createSlatePlugin({
    key: TABS_KEYS.group,
    node: { isElement: true },
  }).withComponent(TabsElementHtml),
  createSlatePlugin({
    key: TABS_KEYS.item,
    node: { isElement: true },
  }).withComponent(TabElementHtml),
];
