'use client';

import { BasicBlocksKit } from '@/components/editor/plugins/basic-blocks-kit';
import { BasicMarksKit } from '@/components/editor/plugins/basic-marks-kit';
import { AccordionKit } from '@/components/editor/plugins/accordion-kit';
import { CalloutKit } from '@/components/editor/plugins/callout-kit';
import { CodeBlockKit } from '@/components/editor/plugins/code-block-kit';
import { IndentKit } from '@/components/editor/plugins/indent-kit';
import { LinkKit } from '@/components/editor/plugins/link-kit';
import { ListKit } from '@/components/editor/plugins/list-kit';
import { MentionPersistedKit } from '@/components/editor/plugins/mention-kit';
import { StepsKit } from '@/components/editor/plugins/steps-kit';
import { TableKit } from '@/components/editor/plugins/table-kit';
import { ToggleKit } from '@/components/editor/plugins/toggle-kit';

export const PersistedEditorKit = [
  ...BasicBlocksKit,
  ...BasicMarksKit,
  ...CodeBlockKit,
  ...IndentKit,
  ...ListKit,
  ...TableKit,
  ...ToggleKit,
  ...StepsKit,
  ...AccordionKit,
  ...CalloutKit,
  ...LinkKit,
  ...MentionPersistedKit,
];
