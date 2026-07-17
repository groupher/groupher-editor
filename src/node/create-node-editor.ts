import type { SlateEditor, Value } from 'platejs';

import { createSlateEditor } from 'platejs';

import { BaseEditorKit } from '@/node/base-editor-kit';
import { assertValidValue } from '@/node/validate-value';

const cloneValue = (value: Value): Value => structuredClone(value);

export const createNodeEditor = (value: unknown = []): SlateEditor => {
  const validValue = assertValidValue(value);

  return createSlateEditor({
    plugins: BaseEditorKit,
    value: cloneValue(validValue),
  });
};
