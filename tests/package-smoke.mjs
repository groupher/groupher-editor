import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';

const packageJson = JSON.parse(
  await readFile(new URL('../package.json', import.meta.url), 'utf8')
);
const nodeSource = await readFile(
  new URL('../dist/node.js', import.meta.url),
  'utf8'
);
const diffSource = await readFile(
  new URL('../dist/diff.js', import.meta.url),
  'utf8'
);
const richEditorSource = await readFile(
  new URL('../dist/rich-editor.js', import.meta.url),
  'utf8'
);
const diffViewerSource = await readFile(
  new URL('../dist/diff-viewer.js', import.meta.url),
  'utf8'
);
const staticSource = await readFile(
  new URL('../dist/static.js', import.meta.url),
  'utf8'
);
const indexDeclarationSource = await readFile(
  new URL('../dist/index.d.ts', import.meta.url),
  'utf8'
);
const nodeDeclarationSource = await readFile(
  new URL('../dist/node.d.ts', import.meta.url),
  'utf8'
);
const editorApiDeclarationSource = await readFile(
  new URL('../dist/editor-api.d.ts', import.meta.url),
  'utf8'
);
const diffViewerDeclarationSource = await readFile(
  new URL('../dist/diff-viewer.d.ts', import.meta.url),
  'utf8'
);
const staticDeclarationSource = await readFile(
  new URL('../dist/static.d.ts', import.meta.url),
  'utf8'
);
const declarationSources = await Promise.all(
  ['diff.d.ts', 'diff/compute.d.ts', 'diff/stats.d.ts', 'diff/types.d.ts'].map(
    (file) => readFile(new URL(`../dist/${file}`, import.meta.url), 'utf8')
  )
);

assert.deepEqual(packageJson.exports['.'], {
  types: './dist/index.d.ts',
  import: './dist/rich-editor.js',
  default: './dist/rich-editor.js',
});
assert.deepEqual(packageJson.exports['./diff-viewer'], {
  types: './dist/diff-viewer.d.ts',
  import: './dist/diff-viewer.js',
  default: './dist/diff-viewer.js',
});
assert.deepEqual(packageJson.exports['./static'], {
  types: './dist/static.d.ts',
  import: './dist/static.js',
  default: './dist/static.js',
});
assert.deepEqual(packageJson.exports['./node'], {
  types: './dist/node.d.ts',
  import: './dist/node.js',
  default: './dist/node.js',
});
assert.deepEqual(packageJson.exports['./diff'], {
  types: './dist/diff.d.ts',
  import: './dist/diff.js',
  default: './dist/diff.js',
});
assert.doesNotMatch(nodeSource, /(?:platejs|@platejs\/[^'"\n]+)\/react/);
assert.doesNotMatch(nodeSource, /import\s+['"][^'"]+\.css['"]/);
assert.doesNotMatch(nodeSource, /\bwindow\s*\./);
assert.doesNotMatch(nodeSource, /\bdocument\s*\./);
assert.doesNotMatch(diffSource, /(?:platejs|@platejs\/[^'"\n]+)\/react/);
assert.doesNotMatch(diffSource, /import\s+['"][^'"]+\.css['"]/);
assert.doesNotMatch(diffSource, /\bwindow\s*\./);
assert.doesNotMatch(diffSource, /\bdocument\s*\./);
assert.doesNotMatch(richEditorSource, /document\.createElement\(['"]i['"]\)/);
assert.doesNotMatch(
  diffViewerSource,
  /@emoji-mart|@platejs\/emoji|@platejs\/markdown|@platejs\/slash-command|remark-gfm/
);
assert.doesNotMatch(staticSource, /(?:platejs|@platejs\/[^'"\n]+)\/react/);
declarationSources.forEach((source) => {
  assert.doesNotMatch(source, /from ['"]@\//);
});
assert.doesNotMatch(indexDeclarationSource, /RichEditorDiff/);
assert.match(nodeDeclarationSource, /deserializeMarkdown/);
assert.match(nodeDeclarationSource, /TRichEditorMarkdownImportResult/);
assert.match(nodeDeclarationSource, /TTabIcon/);
assert.match(nodeDeclarationSource, /TTabsElement/);
assert.doesNotMatch(indexDeclarationSource, /\bvalue\?: TRichEditorValue/);
assert.match(indexDeclarationSource, /TRichEditorHandle/);
assert.match(indexDeclarationSource, /TTabIcon/);
assert.match(indexDeclarationSource, /TTabsElement/);
assert.match(editorApiDeclarationSource, /insertContent/);
assert.match(editorApiDeclarationSource, /content: TRichEditorValue/);
assert.doesNotMatch(editorApiDeclarationSource, /insertFragment/);
assert.match(editorApiDeclarationSource, /type: "document"/);
assert.match(editorApiDeclarationSource, /type: "selection"/);
assert.match(editorApiDeclarationSource, /type: "cursor"/);
assert.match(editorApiDeclarationSource, /type: "block"/);
assert.match(editorApiDeclarationSource, /position: "start" \| "end"/);
assert.match(editorApiDeclarationSource, /captureCursor/);
assert.match(editorApiDeclarationSource, /getOutline/);
assert.match(editorApiDeclarationSource, /TCursorRef/);
assert.match(editorApiDeclarationSource, /TBlockRef/);
assert.match(editorApiDeclarationSource, /TLocation/);
assert.match(editorApiDeclarationSource, /location: TLocation/);
assert.doesNotMatch(editorApiDeclarationSource, /TRichEditor(?:Cursor|Block)Ref/);
assert.doesNotMatch(editorApiDeclarationSource, /TRichEditorLocation/);
assert.doesNotMatch(editorApiDeclarationSource, /TRichEditorInsertFragmentOptions/);
assert.doesNotMatch(editorApiDeclarationSource, /selectionBehavior/);
assert.doesNotMatch(editorApiDeclarationSource, /document-edge/);
assert.match(indexDeclarationSource, /ForwardRefExoticComponent/);
assert.match(diffViewerDeclarationSource, /diffValue: TRichEditorDiffValue/);
assert.match(staticDeclarationSource, /value: TRichEditorValue/);
assert.doesNotMatch(
  diffViewerDeclarationSource,
  /previousValue|currentValue|from ['"]@\//
);

const richEditor = await import('@groupher/rich-editor');
assert.equal(typeof richEditor.default, 'object');
assert.equal(typeof richEditor.TabsSyncProvider, 'function');
assert.equal('RichEditorDiff' in richEditor, false);

const diffViewer = await import('@groupher/rich-editor/diff-viewer');
assert.equal(typeof diffViewer.RichEditorDiff, 'function');
const renderedDiff = renderToString(
  createElement(diffViewer.RichEditorDiff, {
    diffValue: {
      kind: 'rich-editor-diff',
      nodes: [{ type: 'p', children: [{ text: 'SSR diff' }] }],
    },
  })
);
assert.match(renderedDiff, /SSR diff/);

const staticViewer = await import('@groupher/rich-editor/static');
assert.equal(typeof staticViewer.RichEditorStatic, 'function');
const renderedStatic = renderToString(
  createElement(staticViewer.RichEditorStatic, {
    value: [
      {
        type: 'steps',
        children: [
          {
            type: 'step',
            stepNumber: 1,
            children: [
              {
                type: 'step_title',
                children: [{ text: 'Publish steps' }],
              },
              {
                type: 'step_content',
                children: [
                  { type: 'p', children: [{ text: 'Static content' }] },
                ],
              },
            ],
          },
        ],
      },
    ],
  })
);
assert.match(renderedStatic, /<details[^>]*rich-editor-step-details[^>]*open/);
assert.match(renderedStatic, /<summary[^>]*rich-editor-step-heading/);
assert.match(renderedStatic, /rich-editor-step-collapse-pill/);

const renderedStaticTabs = renderToString(
  createElement(staticViewer.RichEditorStatic, {
    value: [
      {
        type: 'tabs',
        defaultValue: 'javascript',
        children: [
          {
            type: 'tab',
            label: 'JavaScript',
            value: 'javascript',
            children: [{ type: 'p', children: [{ text: 'JS SDK' }] }],
          },
          {
            type: 'tab',
            label: 'Python',
            value: 'python',
            children: [{ type: 'p', children: [{ text: 'Python SDK' }] }],
          },
        ],
      },
    ],
  })
);
assert.match(renderedStaticTabs, /role="tablist"/);
assert.match(renderedStaticTabs, /JS SDK/);
assert.match(renderedStaticTabs, /Python SDK/);

const codec = await import('@groupher/rich-editor/node');
assert.equal(codec.RICH_EDITOR_SCHEMA_VERSION, 3);
assert.equal(typeof codec.createNodeEditor, 'function');
assert.equal(typeof codec.deserializeMarkdown, 'function');
assert.equal(typeof codec.validateValue, 'function');
assert.equal(typeof codec.canonicalizeValue, 'function');
assert.equal(typeof codec.serializeMarkdown, 'function');
assert.equal(typeof codec.serializeHtmlUnsafe, 'function');
assert.equal(typeof codec.extractToc, 'function');
assert.equal(typeof codec.extractPlainText, 'function');
const importedTabs = codec.deserializeMarkdown(
  '<Tabs><Tab title="JavaScript">JS SDK</Tab><Tab title="Python">Python SDK</Tab></Tabs>',
  { source: 'mintlify' }
);
assert.equal(importedTabs.value[0].type, 'tabs');
assert.equal(importedTabs.value[0].children[1].label, 'Python');
const renderedNodeTabs = await codec.serializeHtmlUnsafe(importedTabs.value);
assert.match(renderedNodeTabs, /rich-editor-tabs-fallback/);
assert.match(renderedNodeTabs, /JS SDK/);
assert.match(renderedNodeTabs, /Python SDK/);

const diff = await import('@groupher/rich-editor/diff');
assert.equal(typeof diff.computeRichEditorDiff, 'function');
assert.deepEqual(
  diff.computeRichEditorDiff(
    [{ type: 'p', children: [{ text: 'same' }] }],
    [{ type: 'p', children: [{ text: 'same' }] }]
  ),
  {
    diffValue: {
      kind: 'rich-editor-diff',
      nodes: [{ type: 'p', children: [{ text: 'same' }] }],
    },
    hasChanges: false,
    stats: { additions: 0, deletions: 0 },
  }
);
