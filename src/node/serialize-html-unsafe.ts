import { createStaticEditor, serializeHtml } from 'platejs/static';

import { BaseEditorKit } from '@/node/base-editor-kit';
import { withHeadingIds } from '@/node/heading-ids';
import { assertValidValue } from '@/node/validate-value';

export const serializeHtmlUnsafe = async (value: unknown): Promise<string> => {
  const editor = createStaticEditor({
    plugins: BaseEditorKit,
    value: withHeadingIds(assertValidValue(value)),
  });

  return serializeHtml(editor, {
    stripDataAttributes: true,
  });
};
