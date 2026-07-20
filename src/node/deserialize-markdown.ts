import { deserializeMd } from '@platejs/markdown';

import { canonicalizeValue } from '@/node/canonicalize-value';
import { createNodeEditor } from '@/node/create-node-editor';
import { normalizeAccordionMarkdown } from '@/node/markdown-import/normalize-accordion-markdown';
import { normalizeCalloutMarkdown } from '@/node/markdown-import/normalize-callout-markdown';
import type {
  TRichEditorMarkdownImportDiagnostic,
  TRichEditorMarkdownImportOptions,
  TRichEditorMarkdownImportResult,
} from '@/node/types';

type TMutableNode = {
  children?: TMutableNode[];
  compatId?: string;
  text?: string;
  type?: string;
  [key: string]: unknown;
};

const removeUndefinedProperties = (value: unknown): void => {
  if (Array.isArray(value)) {
    value.forEach(removeUndefinedProperties);
    return;
  }

  if (!value || typeof value !== 'object') return;

  Object.entries(value).forEach(([key, item]) => {
    if (item === undefined) {
      delete (value as Record<string, unknown>)[key];
      return;
    }

    removeUndefinedProperties(item);
  });
};

const normalizeImportedCallouts = (
  nodes: TMutableNode[],
  calloutPaths: Map<string, number[]>,
  parentPath: number[] = []
) => {
  nodes.forEach((node, index) => {
    const path = [...parentPath, index];

    if (node.type === 'callout') {
      if (typeof node.compatId === 'string') {
        calloutPaths.set(node.compatId, path);
        delete node.compatId;
      }

      if (
        node.children?.length === 1 &&
        node.children[0].type === 'p' &&
        Array.isArray(node.children[0].children)
      ) {
        node.children = node.children[0].children;
      }

      const firstText = node.children?.[0];
      const lastText = node.children?.at(-1);
      if (typeof firstText?.text === 'string') {
        firstText.text = firstText.text.trimStart();
      }
      if (typeof lastText?.text === 'string') {
        lastText.text = lastText.text.trimEnd();
      }
    }

    if (Array.isArray(node.children)) {
      normalizeImportedCallouts(node.children, calloutPaths, path);
    }
  });
};

const normalizeImportedAccordions = (nodes: TMutableNode[]) => {
  nodes.forEach((node) => {
    if (
      node.type === 'accordion_title' &&
      node.children?.length === 1 &&
      node.children[0].type === 'p' &&
      Array.isArray(node.children[0].children)
    ) {
      node.children = node.children[0].children;
    }

    if (node.type === 'accordion_title') {
      if (!node.children || node.children.length === 0) {
        node.children = [{ text: '' }];
      }

      const firstText = node.children[0];
      const lastText = node.children.at(-1);
      if (typeof firstText?.text === 'string') {
        firstText.text = firstText.text.trimStart();
      }
      if (typeof lastText?.text === 'string') {
        lastText.text = lastText.text.trimEnd();
      }
    }

    if (
      node.type === 'accordion_content' &&
      (!node.children || node.children.length === 0)
    ) {
      node.children = [{ children: [{ text: '' }], type: 'p' }];
    }

    if (Array.isArray(node.children)) {
      normalizeImportedAccordions(node.children);
    }
  });
};

export const deserializeMarkdown = (
  markdown: string,
  options: TRichEditorMarkdownImportOptions = {}
): TRichEditorMarkdownImportResult => {
  const normalized = normalizeCalloutMarkdown(
    markdown,
    options.source ?? 'groupher'
  );
  const value = structuredClone(
    deserializeMd(
      createNodeEditor(),
      normalizeAccordionMarkdown(normalized.markdown)
    )
  ) as TMutableNode[];
  const calloutPaths = new Map<string, number[]>();

  removeUndefinedProperties(value);
  normalizeImportedCallouts(value, calloutPaths);
  normalizeImportedAccordions(value);

  const diagnostics: TRichEditorMarkdownImportDiagnostic[] =
    normalized.diagnostics.map(({ calloutId, ...diagnostic }) => ({
      ...diagnostic,
      path: calloutPaths.get(calloutId) ?? [],
    }));

  return {
    diagnostics,
    value: canonicalizeValue(value),
  };
};
