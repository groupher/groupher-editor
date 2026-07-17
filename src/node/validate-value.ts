import type { Value } from 'platejs';

import {
  RICH_EDITOR_ELEMENT_TYPES,
  RICH_EDITOR_INLINE_ELEMENT_TYPES,
  RICH_EDITOR_MARK_TYPES,
  RICH_EDITOR_TRANSIENT_ELEMENT_TYPES,
} from '@/schema';
import type {
  TRichEditorValidationDiagnostic,
  TRichEditorValidationResult,
} from '@/node/types';

const elementTypes = new Set<string>(RICH_EDITOR_ELEMENT_TYPES);
const inlineElementTypes = new Set<string>(RICH_EDITOR_INLINE_ELEMENT_TYPES);
const markTypes = new Set<string>(RICH_EDITOR_MARK_TYPES);
const transientElementTypes = new Set<string>(
  RICH_EDITOR_TRANSIENT_ELEMENT_TYPES
);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const addDiagnostic = (
  diagnostics: TRichEditorValidationDiagnostic[],
  diagnostic: TRichEditorValidationDiagnostic
) => {
  diagnostics.push(diagnostic);
};

const validateJsonProperty = (
  value: unknown,
  path: number[],
  property: string,
  diagnostics: TRichEditorValidationDiagnostic[]
) => {
  if (
    value === undefined ||
    (typeof value === 'number' && !Number.isFinite(value)) ||
    typeof value === 'bigint' ||
    typeof value === 'function' ||
    typeof value === 'symbol'
  ) {
    addDiagnostic(diagnostics, {
      code: 'invalid_property',
      message: `Property ${property} is not JSON-serializable.`,
      path,
    });
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) =>
      validateJsonProperty(item, path, property, diagnostics)
    );
    return;
  }

  if (isRecord(value)) {
    Object.entries(value).forEach(([key, item]) =>
      validateJsonProperty(item, path, `${property}.${key}`, diagnostics)
    );
  }
};

const validateText = (
  node: Record<string, unknown>,
  path: number[],
  diagnostics: TRichEditorValidationDiagnostic[]
) => {
  if (typeof node.text !== 'string') {
    addDiagnostic(diagnostics, {
      code: 'invalid_node',
      message: 'Text nodes must contain a string text property.',
      nodeType: 'text',
      path,
    });
  }

  Object.entries(node).forEach(([key, value]) => {
    if (key === 'text') return;
    if (key === '_id' || key === 'id') return;

    if (!markTypes.has(key)) {
      addDiagnostic(diagnostics, {
        code: 'unknown_mark',
        message: `Unknown text mark: ${key}.`,
        nodeType: key,
        path,
      });
      return;
    }

    if (typeof value !== 'boolean') {
      addDiagnostic(diagnostics, {
        code: 'invalid_property',
        message: `Text mark ${key} must be a boolean.`,
        nodeType: key,
        path,
      });
    }
  });
};

const validateNode = (
  node: unknown,
  path: number[],
  diagnostics: TRichEditorValidationDiagnostic[],
  isRoot: boolean
) => {
  if (!isRecord(node)) {
    addDiagnostic(diagnostics, {
      code: 'invalid_node',
      message: 'Every editor node must be an object.',
      path,
    });
    return;
  }

  Object.entries(node).forEach(([key, value]) => {
    if (key !== 'children') {
      validateJsonProperty(value, path, key, diagnostics);
    }
  });

  if ('text' in node) {
    if (isRoot) {
      addDiagnostic(diagnostics, {
        code: 'invalid_node_position',
        message: 'Text nodes cannot appear at the document root.',
        nodeType: 'text',
        path,
      });
    }
    validateText(node, path, diagnostics);
    return;
  }

  const nodeType = node.type;
  if (typeof nodeType !== 'string') {
    addDiagnostic(diagnostics, {
      code: 'invalid_node',
      message: 'Element nodes must contain a string type property.',
      path,
    });
    return;
  }

  if (transientElementTypes.has(nodeType)) {
    addDiagnostic(diagnostics, {
      code: 'transient_node',
      message: `Transient editor node cannot be persisted: ${nodeType}.`,
      nodeType,
      path,
    });
  } else if (!elementTypes.has(nodeType)) {
    addDiagnostic(diagnostics, {
      code: 'unknown_node',
      message: `Unknown editor node: ${nodeType}.`,
      nodeType,
      path,
    });
  }

  if (isRoot && inlineElementTypes.has(nodeType)) {
    addDiagnostic(diagnostics, {
      code: 'invalid_node_position',
      message: `Inline node cannot appear at the document root: ${nodeType}.`,
      nodeType,
      path,
    });
  }

  if (!isRoot && elementTypes.has(nodeType) && !inlineElementTypes.has(nodeType)) {
    addDiagnostic(diagnostics, {
      code: 'invalid_node_position',
      message: `Block node cannot be nested inside another element: ${nodeType}.`,
      nodeType,
      path,
    });
  }

  if (!Array.isArray(node.children)) {
    addDiagnostic(diagnostics, {
      code: 'invalid_node',
      message: `Element node ${nodeType} must contain a children array.`,
      nodeType,
      path,
    });
    return;
  }

  node.children.forEach((child, index) =>
    validateNode(child, [...path, index], diagnostics, false)
  );
};

export const validateValue = (value: unknown): TRichEditorValidationResult => {
  if (!Array.isArray(value)) {
    return {
      diagnostics: [
        {
          code: 'invalid_value',
          message: 'Rich editor value must be an array.',
          path: [],
        },
      ],
      valid: false,
    };
  }

  const diagnostics: TRichEditorValidationDiagnostic[] = [];
  value.forEach((node, index) => validateNode(node, [index], diagnostics, true));

  if (diagnostics.length > 0) {
    return { diagnostics, valid: false };
  }

  return { diagnostics: [], valid: true };
};

export const assertValidValue = (value: unknown): Value => {
  const result = validateValue(value);
  if (!result.valid) {
    const error = new Error('Invalid rich editor value.');
    Object.assign(error, { diagnostics: result.diagnostics });
    throw error;
  }

  return value as Value;
};
