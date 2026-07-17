'use client';

import { EmojiKit } from '@/components/editor/plugins/emoji-kit';
import { MarkdownKit } from '@/components/editor/plugins/markdown-kit';
import { MentionTransientKit } from '@/components/editor/plugins/mention-kit';
import { SlashKit } from '@/components/editor/plugins/slash-kit';
import { PersistedEditorKit } from '@/components/editor/persisted-editor-kit';

export const EditorKit = [
  ...PersistedEditorKit,
  ...MarkdownKit,
  ...EmojiKit,
  ...MentionTransientKit,
  ...SlashKit,
];
