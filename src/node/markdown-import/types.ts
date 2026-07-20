import type { TRichEditorMarkdownImportDiagnostic } from '@/node/types';

export type TPendingMarkdownImportDiagnostic = Omit<
  TRichEditorMarkdownImportDiagnostic,
  'path'
> & {
  calloutId: string;
};

export type TMarkdownNormalizationResult = {
  diagnostics: TPendingMarkdownImportDiagnostic[];
  markdown: string;
};
