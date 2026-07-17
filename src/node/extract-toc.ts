import type { TElement, TText } from 'platejs';

import type { TRichEditorTocItem } from '@/node/types';
import { withHeadingIds } from '@/node/heading-ids';
import { extractNodeText } from '@/node/text';
import { assertValidValue } from '@/node/validate-value';

const headingLevels: Record<string, number> = {
  h1: 1,
  h2: 2,
  h3: 3,
  h4: 4,
  h5: 5,
  h6: 6,
};

const isText = (node: TElement | TText): node is TText => 'text' in node;

export const extractToc = (value: unknown): TRichEditorTocItem[] => {
  const valueWithIds = withHeadingIds(assertValidValue(value));
  const toc: TRichEditorTocItem[] = [];

  const visit = (node: TElement | TText) => {
    if (isText(node)) return;

    const level = headingLevels[String(node.type)];
    if (level && typeof node.id === 'string') {
      toc.push({
        id: node.id,
        level,
        title: extractNodeText(node),
      });
    }

    node.children.forEach(visit);
  };

  valueWithIds.forEach(visit);
  return toc;
};
