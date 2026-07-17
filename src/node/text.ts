import type { TElement, TText, Value } from 'platejs';

const isText = (node: TElement | TText): node is TText => 'text' in node;

export const extractNodeText = (node: TElement | TText): string => {
  if (isText(node)) return node.text;
  if (node.type === 'mention') {
    return typeof node.value === 'string' ? `@${node.value}` : '@unknown';
  }

  return node.children.map(extractNodeText).join('');
};

export const extractValueText = (value: Value): string =>
  value.map(extractNodeText).join('\n');
