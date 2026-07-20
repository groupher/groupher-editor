'use client';

import { createPlatePlugin } from 'platejs/react';

import { ACCORDION_KEYS } from '@/accordion';
import { AccordionContentElement } from '@/components/ui/accordion-content-node';
import { AccordionGroupElement } from '@/components/ui/accordion-group-node';
import { AccordionElement } from '@/components/ui/accordion-node';
import { AccordionTitleElement } from '@/components/ui/accordion-title-node';

export const AccordionKit = [
  createPlatePlugin({
    key: ACCORDION_KEYS.group,
    node: { isElement: true },
  }).withComponent(AccordionGroupElement),
  createPlatePlugin({
    key: ACCORDION_KEYS.item,
    node: { isElement: true },
  }).withComponent(AccordionElement),
  createPlatePlugin({
    key: ACCORDION_KEYS.title,
    node: { isElement: true },
  }).withComponent(AccordionTitleElement),
  createPlatePlugin({
    key: ACCORDION_KEYS.content,
    node: { isElement: true },
  }).withComponent(AccordionContentElement),
];
