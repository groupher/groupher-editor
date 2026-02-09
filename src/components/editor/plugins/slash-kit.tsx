'use client';

import { SlashInputPlugin, SlashPlugin } from '@platejs/slash-command/react';

import { SlashInputElement } from '@/components/ui/slash-node';

export const SlashKit = [
  SlashPlugin.configure({
    options: {
      trigger: '/',
      triggerPreviousCharPattern: /^\s?$/,
    },
  }),
  SlashInputPlugin.withComponent(SlashInputElement),
];
