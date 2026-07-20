import { deserializeMd, serializeMd } from '@platejs/markdown';
import { createSlateEditor } from 'platejs';
import { describe, expect, it } from 'vitest';

import { MarkdownKit } from '../src/components/editor/plugins/markdown-kit';
import { PersistedEditorKit } from '../src/components/editor/persisted-editor-kit';
import {
  RICH_EDITOR_SCHEMA_VERSION,
  canonicalizeValue,
  createNodeEditor,
  extractPlainText,
  extractToc,
  serializeHtmlUnsafe,
  serializeMarkdown,
  validateValue,
} from '../src/node';
import { BaseEditorKit } from '../src/node/base-editor-kit';
import {
  RICH_EDITOR_ELEMENT_TYPES,
  RICH_EDITOR_MARK_TYPES,
  RICH_EDITOR_TRANSIENT_ELEMENT_TYPES,
} from '../src/schema';
import {
  FULL_VALUE,
  FULL_VALUE_MARKDOWN,
  FULL_VALUE_PLAIN_TEXT,
} from './fixtures/full-value';

const pluginKeys = (plugins: typeof BaseEditorKit) =>
  new Set(
    createSlateEditor({ plugins, value: [] }).meta.pluginList.map(
      (plugin) => plugin.key
    )
  );

describe('Node codec contract', () => {
  it('uses an explicit schema version', () => {
    expect(RICH_EDITOR_SCHEMA_VERSION).toBe(1);
  });

  it('keeps browser and Node persisted schema registrations aligned', () => {
    const browserKeys = pluginKeys(PersistedEditorKit);
    const nodeKeys = pluginKeys(BaseEditorKit);

    [
      ...RICH_EDITOR_ELEMENT_TYPES,
      ...RICH_EDITOR_MARK_TYPES,
      'indent',
      'list',
    ].forEach((key) => {
      expect(browserKeys.has(key), `browser plugin ${key}`).toBe(true);
      expect(nodeKeys.has(key), `Node plugin ${key}`).toBe(true);
    });

    RICH_EDITOR_TRANSIENT_ELEMENT_TYPES.forEach((key) => {
      expect(nodeKeys.has(key), `Node transient plugin ${key}`).toBe(false);
    });
  });

  it('produces the same Markdown from browser and Node plugin layers', () => {
    const browserEditor = createSlateEditor({
      plugins: [...PersistedEditorKit, ...MarkdownKit],
      value: structuredClone(FULL_VALUE),
    });

    expect(serializeMd(browserEditor)).toBe(serializeMarkdown(FULL_VALUE));
    expect(serializeMarkdown(FULL_VALUE)).toBe(FULL_VALUE_MARKDOWN);
  });

  it('accepts Plate-native nested blocks produced by Markdown deserialization', () => {
    const value = deserializeMd(
      createNodeEditor(),
      '> ## Documentation Index\n>\n> Fetch the complete documentation index.'
    );

    expect(value).toEqual([
      {
        children: [
          {
            children: [{ text: 'Documentation Index' }],
            type: 'h2',
          },
          {
            children: [{ text: 'Fetch the complete documentation index.' }],
            type: 'p',
          },
        ],
        type: 'blockquote',
      },
    ]);
    expect(validateValue(value)).toEqual({ diagnostics: [], valid: true });
  });

  it('creates an isolated Node editor without mutating the input', () => {
    const value = structuredClone(FULL_VALUE);
    const before = structuredClone(value);
    const editor = createNodeEditor(value);

    expect(editor.children).not.toBe(value);
    expect(value).toEqual(before);
  });

  it('validates the complete persisted fixture', () => {
    expect(validateValue(FULL_VALUE)).toEqual({
      diagnostics: [],
      valid: true,
    });
  });

  it('rejects unknown and transient nodes with structured paths', () => {
    expect(
      validateValue([
        { type: 'video', children: [{ text: '' }] },
        { type: 'mention_input', children: [{ text: '' }] },
      ])
    ).toEqual({
      diagnostics: [
        {
          code: 'unknown_node',
          message: 'Unknown editor node: video.',
          nodeType: 'video',
          path: [0],
        },
        {
          code: 'transient_node',
          message:
            'Transient editor node cannot be persisted: mention_input.',
          nodeType: 'mention_input',
          path: [1],
        },
      ],
      valid: false,
    });
  });

  it('canonicalizes recursively and removes transient identity fields', () => {
    expect(
      canonicalizeValue([
        {
          type: 'p',
          id: 'block-id',
          _id: 'legacy-id',
          children: [{ text: 'Body', id: 'leaf-id' }],
        },
      ])
    ).toEqual([
      {
        children: [{ text: 'Body' }],
        type: 'p',
      },
    ]);
  });

  it('extracts stable plain text and TOC ids', () => {
    expect(extractPlainText(FULL_VALUE)).toBe(FULL_VALUE_PLAIN_TEXT);
    expect(extractToc(FULL_VALUE)).toEqual([
      { id: '发布流程', level: 1, title: '发布流程' },
      { id: '发布流程-2', level: 2, title: '发布流程' },
      { id: 'heading-three', level: 3, title: 'Heading Three' },
      { id: 'custom-heading', level: 4, title: 'Heading Four' },
      { id: 'heading-five', level: 5, title: 'Heading Five' },
      { id: 'heading-six', level: 6, title: 'Heading Six' },
    ]);
  });

  it('serializes every persisted element to static HTML', async () => {
    const html = await serializeHtmlUnsafe(FULL_VALUE);

    expect(html).toContain('data-block-id="发布流程"');
    expect(html).toContain('data-block-id="发布流程-2"');
    expect(html).toContain('<h3');
    expect(html).toContain('<h4');
    expect(html).toContain('<h5');
    expect(html).toContain('<h6');
    expect(html).toContain('<a data-slate-inline="true"');
    expect(html).toContain('@Alice');
    expect(html).toContain('class="slate-callout');
    expect(html).toContain('<details open="">');
    expect(html).toContain('<blockquote');
    expect(html).toContain('<hr');
    expect(html).toContain('<ul');
    expect(html).toContain('<ol');
    expect(html).toContain('type="checkbox"');
  });
});
