import type { TElement } from 'platejs';

export const CODE_GROUP_KEYS = {
  group: 'code_group',
  item: 'code_group_item',
} as const;

export type TCodeGroupItemElement = TElement & {
  codeGroupIndex?: number;
  label?: string;
};

export type TCodeGroupElement = TElement & {
  children: TCodeGroupItemElement[];
  groupId?: string;
};

const textContent = (node: unknown): string => {
  if (!node || typeof node !== 'object') return '';
  if ('text' in node && typeof node.text === 'string') return node.text;
  if (!('children' in node) || !Array.isArray(node.children)) return '';

  return node.children.map(textContent).join('\n');
};

const hash = (value: string): string => {
  let result = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }

  return (result >>> 0).toString(36);
};

export const getCodeGroupItemLabel = (
  item: TCodeGroupItemElement,
  index: number
): string => {
  const label = typeof item.label === 'string' ? item.label.trim() : '';
  if (label) return label;

  const codeBlock = item.children.find(
    (child) => 'type' in child && child.type === 'code_block'
  );
  const language =
    codeBlock && 'lang' in codeBlock && typeof codeBlock.lang === 'string'
      ? codeBlock.lang.trim()
      : '';

  return language ? language.toUpperCase() : `Code ${index + 1}`;
};

export const getCodeGroupDomId = (element: TCodeGroupElement): string => {
  const explicitId =
    typeof element.groupId === 'string' ? element.groupId.trim() : '';
  const fallback = hash(
    element.children
      .map((item, index) => `${getCodeGroupItemLabel(item, index)}:${textContent(item)}`)
      .join('|')
  );
  const safeId = (explicitId || fallback).replace(/[^a-zA-Z0-9_-]/g, '-');

  return `rich-editor-code-group-${safeId}`;
};
