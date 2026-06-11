'use client';

import { createPlatePlugin } from 'platejs/react';

import { CalloutElement } from '@/components/ui/callout-node';
import { LinkElement } from '@/components/ui/link-node';
import { ListItemElement, NumberedListElement, BulletedListElement } from '@/components/ui/list-node';
import { MentionElement } from '@/components/ui/mention-node';
import { TodoListItemElement } from '@/components/ui/todo-node';
import { ToggleElement } from '@/components/ui/toggle-node';

export const BulletedListPlugin = createPlatePlugin({
  key: 'bulleted-list',
  node: { isElement: true },
}).withComponent(BulletedListElement);

export const NumberedListPlugin = createPlatePlugin({
  key: 'numbered-list',
  node: { isElement: true },
}).withComponent(NumberedListElement);

export const ListItemPlugin = createPlatePlugin({
  key: 'list-item',
  node: { isElement: true },
}).withComponent(ListItemElement);

export const TodoListItemPlugin = createPlatePlugin({
  key: 'todo-list-item',
  node: { isElement: true },
}).withComponent(TodoListItemElement);

export const TogglePlugin = createPlatePlugin({
  key: 'toggle',
  node: { isElement: true },
}).withComponent(ToggleElement);

export const CalloutPlugin = createPlatePlugin({
  key: 'callout',
  node: { isElement: true },
}).withComponent(CalloutElement);

export const MentionPlugin = createPlatePlugin({
  key: 'mention',
  node: { isElement: true, isInline: true, isVoid: true },
}).withComponent(MentionElement);

export const LinkPlugin = createPlatePlugin({
  key: 'link',
  node: { isElement: true, isInline: true },
}).withComponent(LinkElement);

export const CustomElementsKit = [
  BulletedListPlugin,
  NumberedListPlugin,
  ListItemPlugin,
  TodoListItemPlugin,
  TogglePlugin,
  CalloutPlugin,
  MentionPlugin,
  LinkPlugin,
];
