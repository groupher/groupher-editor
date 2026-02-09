'use client';

import { BasicBlocksKit } from '@/components/editor/plugins/basic-blocks-kit';
import { BasicMarksKit } from '@/components/editor/plugins/basic-marks-kit';
import { AutoformatKit } from '@/components/editor/plugins/autoformat-kit';
import { CalloutKit } from '@/components/editor/plugins/callout-kit';
import { EmojiKit } from '@/components/editor/plugins/emoji-kit';
import { IndentKit } from '@/components/editor/plugins/indent-kit';
import { LinkKit } from '@/components/editor/plugins/link-kit';
import { ListKit } from '@/components/editor/plugins/list-kit';
import { MentionKit } from '@/components/editor/plugins/mention-kit';
import { SlashKit } from '@/components/editor/plugins/slash-kit';
import { ToggleKit } from '@/components/editor/plugins/toggle-kit';

export const EditorKit = [
  ...BasicBlocksKit,
  ...BasicMarksKit,
  ...AutoformatKit,
  ...EmojiKit,
  ...IndentKit,
  ...ListKit,
  ...ToggleKit,
  ...CalloutKit,
  ...LinkKit,
  ...MentionKit,
  ...SlashKit,
];
