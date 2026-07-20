import { createSlatePlugin } from 'platejs';

import { StepContentElementStatic } from '@/components/ui/step-content-node-static';
import { StepElementStatic } from '@/components/ui/step-node-static';
import { StepsElementStatic } from '@/components/ui/steps-node-static';
import { StepTitleElementStatic } from '@/components/ui/step-title-node-static';
import { STEPS_KEYS } from '@/steps';

export const BaseStepsKit = [
  createSlatePlugin({
    key: STEPS_KEYS.group,
    node: { isElement: true },
  }).withComponent(StepsElementStatic),
  createSlatePlugin({
    key: STEPS_KEYS.item,
    node: { isElement: true },
  }).withComponent(StepElementStatic),
  createSlatePlugin({
    key: STEPS_KEYS.title,
    node: { isElement: true },
  }).withComponent(StepTitleElementStatic),
  createSlatePlugin({
    key: STEPS_KEYS.content,
    node: { isElement: true },
  }).withComponent(StepContentElementStatic),
];
