'use client';

import { MentionInputPlugin, MentionPlugin } from '@platejs/mention/react';

import {
  MentionElement,
  MentionInputElement,
} from '@/components/ui/mention-node';

export const MentionPersistedKit = [
  MentionPlugin.configure({
    options: {
      triggerPreviousCharPattern: /^$|^[\s"']$/,
    },
  }).withComponent(MentionElement),
];

export const MentionTransientKit = [
  MentionInputPlugin.withComponent(MentionInputElement),
];

export const MentionKit = [
  ...MentionPersistedKit,
  ...MentionTransientKit,
];
