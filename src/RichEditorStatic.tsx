import './global.css';

import { createStaticEditor, PlateStatic } from 'platejs/static';

import { BaseEditorKit } from '@/node/base-editor-kit';
import type { TRichEditorValue } from '@/types';

export type TRichEditorStaticProps = {
  className?: string;
  value: TRichEditorValue;
};

export function RichEditorStatic({
  className,
  value,
}: TRichEditorStaticProps) {
  const editor = createStaticEditor({
    plugins: BaseEditorKit,
    value,
  });

  return <PlateStatic editor={editor} value={value} className={className} />;
}
