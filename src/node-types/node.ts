import type { SlateEditor, Value } from 'platejs';

export type TRichEditorValidationCode =
  | 'invalid_node'
  | 'invalid_node_position'
  | 'invalid_property'
  | 'invalid_value'
  | 'transient_node'
  | 'unknown_mark'
  | 'unknown_node';

export type TRichEditorValidationDiagnostic = {
  code: TRichEditorValidationCode;
  message: string;
  path: number[];
  nodeType?: string;
};

export type TRichEditorValidationResult =
  | { diagnostics: []; valid: true }
  | { diagnostics: TRichEditorValidationDiagnostic[]; valid: false };

export type TRichEditorTocItem = {
  id: string;
  level: number;
  title: string;
};

export type TRichEditorJsonPrimitive = boolean | null | number | string;

export type TRichEditorJsonValue =
  | TRichEditorJsonPrimitive
  | TRichEditorJsonValue[]
  | { [key: string]: TRichEditorJsonValue };

export type TRichEditorCanonicalValue = TRichEditorJsonValue[];

export type TRichEditorMarkdownSource =
  | 'docusaurus'
  | 'fumadocs'
  | 'gitbook'
  | 'github'
  | 'groupher'
  | 'mintlify'
  | 'mkdocs-material'
  | 'nextra'
  | 'rspress'
  | 'starlight'
  | 'vitepress';

export type TRichEditorMarkdownImportDiagnostic = {
  code: 'unsupported_attribute';
  message: string;
  path: number[];
  severity: 'warning';
  attribute?: string;
};

export type TRichEditorMarkdownImportOptions = {
  source?: TRichEditorMarkdownSource;
};

export type TRichEditorMarkdownImportResult = {
  diagnostics: TRichEditorMarkdownImportDiagnostic[];
  value: TRichEditorCanonicalValue;
};

export declare const RICH_EDITOR_SCHEMA_VERSION: 2;

export declare const createNodeEditor: (value?: unknown) => SlateEditor;

export declare const deserializeMarkdown: (
  markdown: string,
  options?: TRichEditorMarkdownImportOptions
) => TRichEditorMarkdownImportResult;

export declare const validateValue: (
  value: unknown
) => TRichEditorValidationResult;

export declare const canonicalizeValue: (
  value: unknown
) => TRichEditorCanonicalValue;

export declare const serializeMarkdown: (value: unknown) => string;

export declare const serializeHtmlUnsafe: (value: unknown) => Promise<string>;

export declare const extractToc: (value: unknown) => TRichEditorTocItem[];

export declare const extractPlainText: (value: unknown) => string;

export type TRichEditorNodeValue = Value;
