import './global.css';

import { createStaticEditor, PlateStatic } from 'platejs/static';

import { StaticCodeBlockKit } from '@/components/editor/plugins/code-block-static-kit';
import { StaticTabsKit } from '@/components/editor/plugins/tabs-static-kit';
import { TabsSyncProvider } from '@/components/ui/tabs-sync-provider';
import { createBaseEditorKit } from '@/node/base-editor-kit';
import type { TRichEditorValue } from '@/types';

const StaticEditorKit = createBaseEditorKit(StaticCodeBlockKit, StaticTabsKit);

export type TRichEditorStaticProps = {
  className?: string;
  value: TRichEditorValue;
};

export function RichEditorStatic({
  className,
  value,
}: TRichEditorStaticProps) {
  const editor = createStaticEditor({
    plugins: StaticEditorKit,
    value,
  });

  return (
    <TabsSyncProvider>
      <PlateStatic editor={editor} value={value} className={className} />
    </TabsSyncProvider>
  );
}
