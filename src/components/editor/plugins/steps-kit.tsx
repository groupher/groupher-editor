'use client';

import { createPlatePlugin } from 'platejs/react';

import { StepContentElement } from '@/components/ui/step-content-node';
import { StepElement } from '@/components/ui/step-node';
import { StepsElement } from '@/components/ui/steps-node';
import { StepTitleElement } from '@/components/ui/step-title-node';
import { STEPS_KEYS } from '@/steps';

export const StepsKit = [
  createPlatePlugin({
    key: STEPS_KEYS.group,
    node: { isElement: true },
  }).withComponent(StepsElement),
  createPlatePlugin({
    key: STEPS_KEYS.item,
    node: { isElement: true },
  }).withComponent(StepElement),
  createPlatePlugin({
    key: STEPS_KEYS.title,
    node: { isElement: true },
  }).withComponent(StepTitleElement),
  createPlatePlugin({
    key: STEPS_KEYS.content,
    node: { isElement: true },
  }).withComponent(StepContentElement),
];
