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
  | {
      diagnostics: [];
      valid: true;
    }
  | {
      diagnostics: TRichEditorValidationDiagnostic[];
      valid: false;
    };

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
