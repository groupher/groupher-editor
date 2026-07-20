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
declarationSources.forEach((source) => {
  assert.doesNotMatch(source, /from ['"]@\//);
});
assert.doesNotMatch(indexDeclarationSource, /RichEditorDiff/);
assert.match(nodeDeclarationSource, /deserializeMarkdown/);
assert.match(nodeDeclarationSource, /TRichEditorMarkdownImportResult/);
assert.doesNotMatch(indexDeclarationSource, /\bvalue\?: TRichEditorValue/);
assert.match(indexDeclarationSource, /TRichEditorHandle/);
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
assert.doesNotMatch(
  diffViewerDeclarationSource,
  /previousValue|currentValue|from ['"]@\//
);

const richEditor = await import('@groupher/rich-editor');
assert.equal(typeof richEditor.default, 'object');
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

const codec = await import('@groupher/rich-editor/node');
assert.equal(codec.RICH_EDITOR_SCHEMA_VERSION, 1);
assert.equal(typeof codec.createNodeEditor, 'function');
assert.equal(typeof codec.deserializeMarkdown, 'function');
assert.equal(typeof codec.validateValue, 'function');
assert.equal(typeof codec.canonicalizeValue, 'function');
assert.equal(typeof codec.serializeMarkdown, 'function');
assert.equal(typeof codec.serializeHtmlUnsafe, 'function');
assert.equal(typeof codec.extractToc, 'function');
assert.equal(typeof codec.extractPlainText, 'function');

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
