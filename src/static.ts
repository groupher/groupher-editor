import type { ComponentType } from 'react';

import type { TRichEditorValue } from './index';

export type TRichEditorStaticProps = {
  className?: string;
  value: TRichEditorValue;
};

export declare const RichEditorStatic: ComponentType<TRichEditorStaticProps>;
