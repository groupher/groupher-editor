import type { TElement, TText, Value } from 'platejs';

import { extractNodeText } from '@/node/text';

const headingTypes = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

const isText = (node: TElement | TText): node is TText => 'text' in node;

const slugify = (value: string): string =>
  value
    .normalize('NFKC')
    .toLocaleLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '');

export const withHeadingIds = (value: Value): Value => {
  const clonedValue = structuredClone(value);
  const seen = new Map<string, number>();
  let headingIndex = 0;

  const visit = (node: TElement | TText) => {
    if (isText(node)) return;

    if (headingTypes.has(String(node.type))) {
      headingIndex += 1;
      const existingId = typeof node.id === 'string' ? node.id.trim() : '';
      const baseId = existingId || slugify(extractNodeText(node)) || `heading-${headingIndex}`;
      const occurrence = (seen.get(baseId) ?? 0) + 1;
      seen.set(baseId, occurrence);
      node.id = occurrence === 1 ? baseId : `${baseId}-${occurrence}`;
    }

    node.children.forEach(visit);
  };

  clonedValue.forEach(visit);
  return clonedValue;
};
