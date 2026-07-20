import { createSlatePlugin } from 'platejs';

import { ACCORDION_KEYS } from '@/accordion';
import { AccordionContentElementStatic } from '@/components/ui/accordion-content-node-static';
import { AccordionGroupElementStatic } from '@/components/ui/accordion-group-node-static';
import { AccordionElementStatic } from '@/components/ui/accordion-node-static';
import { AccordionTitleElementStatic } from '@/components/ui/accordion-title-node-static';

export const BaseAccordionKit = [
  createSlatePlugin({
    key: ACCORDION_KEYS.group,
    node: { isElement: true },
  }).withComponent(AccordionGroupElementStatic),
  createSlatePlugin({
    key: ACCORDION_KEYS.item,
    node: { isElement: true },
  }).withComponent(AccordionElementStatic),
  createSlatePlugin({
    key: ACCORDION_KEYS.title,
    node: { isElement: true },
  }).withComponent(AccordionTitleElementStatic),
  createSlatePlugin({
    key: ACCORDION_KEYS.content,
    node: { isElement: true },
  }).withComponent(AccordionContentElementStatic),
];
