# @groupher/rich-editor

Groupher's Plate-based React editor and its headless Node codec.

## Browser editor

```tsx
import RichEditor from '@groupher/rich-editor';
import '@groupher/rich-editor/style.css';
```

The default entry contains the interactive client editor. Its module graph is
safe to load during SSR compilation, but the component still belongs in a
client component tree.

## Diff viewer

```tsx
import { RichEditorDiff } from '@groupher/rich-editor/diff-viewer';
import '@groupher/rich-editor/style.css';
```

The read-only viewer is a separate SSR-safe entrypoint. It only includes the
persisted block kit and diff styling; Markdown, emoji, slash commands, and
other editing-only capabilities remain in the default editor entry.

## Node codec

```ts
import {
  RICH_EDITOR_SCHEMA_VERSION,
  canonicalizeValue,
  createNodeEditor,
  extractPlainText,
  extractToc,
  serializeHtmlUnsafe,
  serializeMarkdown,
  validateValue,
} from '@groupher/rich-editor/node';
```

`@groupher/rich-editor/node` is a separate ESM entrypoint. It does not import
the browser editor, CSS, client hooks, toolbar, floating UI, emoji picker, or
slash/mention input components. It uses the Base Plate plugins that correspond
to the browser editor's persisted schema.

The codec exports:

- `RICH_EDITOR_SCHEMA_VERSION`: explicit persisted schema version.
- `createNodeEditor(value)`: creates an isolated headless Plate editor.
- `validateValue(value)`: rejects malformed, unknown, and transient nodes with
  structured `code`, `path`, and `nodeType` diagnostics.
- `canonicalizeValue(value)`: recursively removes `id` and `_id`, removes
  undefined values, and sorts object keys for stable hashing.
- `serializeMarkdown(value)`: serializes with Plate's Markdown codec and the
  editor's callout, toggle, mention, mark, and list rules.
- `serializeHtmlUnsafe(value)`: renders Plate static HTML. The caller must apply
  the final application-specific sanitizer before storing or serving it.
- `extractToc(value)`: extracts headings and assigns stable ids when absent.
- `extractPlainText(value)`: extracts deterministic block-separated text.

## Development

```sh
npm run typecheck
npm test
npm run test:package
```

`test:package` builds all four entries, verifies Node imports and server-renders
the Diff viewer without DOM globals, then checks the real npm tarball contents.
