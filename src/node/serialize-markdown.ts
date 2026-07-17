import { serializeMd } from '@platejs/markdown';

import { createNodeEditor } from '@/node/create-node-editor';

export const serializeMarkdown = (value: unknown): string =>
  serializeMd(createNodeEditor(value));
