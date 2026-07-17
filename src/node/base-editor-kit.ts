import { BaseBasicBlocksKit } from '@/components/editor/plugins/basic-blocks-base-kit';
import { BaseBasicMarksKit } from '@/components/editor/plugins/basic-marks-base-kit';
import { BaseCalloutKit } from '@/components/editor/plugins/callout-base-kit';
import { BaseIndentKit } from '@/components/editor/plugins/indent-base-kit';
import { BaseLinkKit } from '@/components/editor/plugins/link-base-kit';
import { BaseListKit } from '@/components/editor/plugins/list-base-kit';
import { MarkdownKit } from '@/components/editor/plugins/markdown-kit';
import { BaseMentionKit } from '@/components/editor/plugins/mention-base-kit';
import { BaseToggleKit } from '@/components/editor/plugins/toggle-base-kit';

export const BaseEditorKit = [
  ...BaseBasicBlocksKit,
  ...BaseBasicMarksKit,
  ...BaseIndentKit,
  ...BaseListKit,
  ...BaseToggleKit,
  ...BaseCalloutKit,
  ...BaseLinkKit,
  ...BaseMentionKit,
  ...MarkdownKit,
];
