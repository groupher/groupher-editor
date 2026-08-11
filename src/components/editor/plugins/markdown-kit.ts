import {
  convertChildrenDeserialize,
  convertNodesSerialize,
  MarkdownPlugin,
  type MdRules,
  parseAttributes,
  propsToAttributes,
  remarkMdx,
  remarkMention,
} from '@platejs/markdown';
import type { Descendant, TElement, TText } from 'platejs';

import { getPluginType, KEYS } from 'platejs';
import remarkGfm from 'remark-gfm';

import { ACCORDION_KEYS } from '@/accordion';
import { CODE_GROUP_KEYS } from '@/code-group';
import { createRemarkTabsPlugin } from '@/node/markdown-import/remark-tabs-compat';
import { extractNodeText } from '@/node/text';
import { STEPS_KEYS } from '@/steps';
import {
  TABS_KEYS,
  type TTabElement,
  type TTabIcon,
  type TTabsElement,
} from '@/tabs';

type TMdRule = NonNullable<MdRules[string]>;
type TMdxAttribute = {
  name?: string;
  value?: unknown;
};

const parseFlowAttributes = (
  attributes: TMdxAttribute[] | undefined
): Record<string, unknown> => {
  const properties = parseAttributes(attributes ?? []);

  attributes?.forEach((attribute) => {
    if (!attribute.name) return;

    if (attribute.value === undefined || attribute.value === null) {
      properties[attribute.name] = true;
      return;
    }

    if (
      typeof attribute.value === 'object' &&
      attribute.value !== null &&
      'type' in attribute.value &&
      attribute.value.type === 'mdxJsxAttributeValueExpression' &&
      'value' in attribute.value &&
      typeof attribute.value.value === 'string'
    ) {
      try {
        properties[attribute.name] = JSON.parse(attribute.value.value);
      } catch {
        properties[attribute.name] = attribute.value;
      }
    }
  });

  return properties;
};

const stripReservedProperties = (properties: Record<string, unknown>) => {
  delete properties._id;
  delete properties.children;
  delete properties.id;
  delete properties.type;

  return properties;
};

const isText = (node: Descendant): node is TText => 'text' in node;

const stepContentChildren = (
  children: Descendant[],
  paragraphType: string
): Descendant[] => {
  if (children.every(isText)) {
    return [{ children, type: paragraphType }];
  }

  return children;
};

const portableFlowElement = (
  name: string
): NonNullable<MdRules['callout']> => ({
  deserialize: (node, decoration, options) => ({
    children: convertChildrenDeserialize(node.children, decoration, options),
    type: getPluginType(options.editor, name),
    ...parseAttributes(node.attributes),
  }),
  serialize: (node, options) => {
    const attributes: Record<string, unknown> = { ...node };
    delete attributes._id;
    delete attributes.children;
    delete attributes.id;
    delete attributes.type;

    return {
      attributes: propsToAttributes(attributes),
      children: convertNodesSerialize(node.children, options),
      name,
      type: 'mdxJsxFlowElement',
    };
  },
});

const portableExpressionFlowElement = (
  name: string
): NonNullable<MdRules['callout']> => ({
  ...portableFlowElement(name),
  deserialize: (node, decoration, options) => ({
    ...stripReservedProperties(parseFlowAttributes(node.attributes)),
    children: convertChildrenDeserialize(node.children, decoration, options),
    type: getPluginType(options.editor, name),
  }),
});

const stepsDeserialize: TMdRule['deserialize'] = (
  node,
  decoration,
  options
) => ({
  ...stripReservedProperties(parseFlowAttributes(node.attributes)),
  children: convertChildrenDeserialize(node.children, decoration, options),
  type: getPluginType(options.editor, STEPS_KEYS.group),
});

const stepsRule: TMdRule = {
  deserialize: stepsDeserialize,
  serialize: (node, options) => {
    const attributes = stripReservedProperties({ ...node });

    return {
      attributes: propsToAttributes(attributes),
      children: convertNodesSerialize(node.children, options),
      name: STEPS_KEYS.group,
      type: 'mdxJsxFlowElement',
    };
  },
};

const stepDeserialize: TMdRule['deserialize'] = (
  node,
  decoration,
  options
) => {
  const attributes = parseFlowAttributes(node.attributes);
  const title = typeof attributes.title === 'string' ? attributes.title : '';
  const anchorId =
    typeof attributes.id === 'string' ? attributes.id.trim() : undefined;
  const properties = stripReservedProperties({ ...attributes });
  delete properties.title;

  return {
    ...properties,
    ...(anchorId ? { anchorId } : {}),
    children: [
      {
        children: [{ text: title }],
        type: getPluginType(options.editor, STEPS_KEYS.title),
      },
      {
        children: stepContentChildren(
          convertChildrenDeserialize(node.children, decoration, options),
          getPluginType(options.editor, KEYS.p)
        ),
        type: getPluginType(options.editor, STEPS_KEYS.content),
      },
    ],
    type: getPluginType(options.editor, STEPS_KEYS.item),
  };
};

const stepRule: TMdRule = {
  deserialize: stepDeserialize,
  serialize: (node, options) => {
    const titleNode = node.children.find(
      (child: TElement | TText) =>
        !isText(child) && child.type === STEPS_KEYS.title
    );
    const contentNode = node.children.find(
      (child: TElement | TText) =>
        !isText(child) && child.type === STEPS_KEYS.content
    );
    const attributes = stripReservedProperties({ ...node });
    const anchorId = attributes.anchorId;
    delete attributes.anchorId;
    attributes.title = titleNode ? extractNodeText(titleNode) : '';
    if (typeof anchorId === 'string' && anchorId.trim()) {
      attributes.id = anchorId;
    }

    return {
      attributes: propsToAttributes(attributes),
      children: contentNode
        ? convertNodesSerialize(contentNode.children, options)
        : [],
      name: STEPS_KEYS.item,
      type: 'mdxJsxFlowElement',
    };
  },
};

const isTabIcon = (value: unknown): value is TTabIcon => {
  if (!value || typeof value !== 'object') return false;

  if ('type' in value && value.type === 'lucide') {
    return (
      'name' in value &&
      typeof value.name === 'string' &&
      value.name.trim().length > 0
    );
  }
  if ('type' in value && value.type === 'image') {
    return (
      'src' in value &&
      typeof value.src === 'string' &&
      value.src.trim().length > 0
    );
  }
  if ('type' in value && value.type === 'vendor') {
    return (
      'library' in value &&
      (value.library === 'fontawesome' ||
        value.library === 'mintlify' ||
        value.library === 'starlight') &&
      'name' in value &&
      typeof value.name === 'string' &&
      value.name.trim().length > 0
    );
  }

  return false;
};

const tabsDeserialize: TMdRule['deserialize'] = (
  node,
  decoration,
  options
) => {
  const attributes = parseFlowAttributes(node.attributes);
  const defaultValue =
    typeof attributes.defaultValue === 'string'
      ? attributes.defaultValue.trim()
      : '';
  const syncTabKey =
    typeof attributes.syncTabKey === 'string'
      ? attributes.syncTabKey.trim()
      : '';
  const orientation =
    attributes.orientation === 'vertical' ? 'vertical' : undefined;
  const persist =
    syncTabKey &&
    (attributes.persist === 'local' || attributes.persist === 'session')
      ? attributes.persist
      : undefined;

  return {
    children: convertChildrenDeserialize(node.children, decoration, options),
    ...(defaultValue ? { defaultValue } : {}),
    ...(orientation ? { orientation } : {}),
    ...(persist ? { persist } : {}),
    ...(syncTabKey ? { syncTabKey } : {}),
    type: getPluginType(options.editor, TABS_KEYS.group),
  };
};

const tabsRule: TMdRule = {
  deserialize: tabsDeserialize,
  serialize: (node, options) => {
    const tabs = node as TTabsElement;

    return {
      attributes: propsToAttributes({
        ...(tabs.defaultValue ? { defaultValue: tabs.defaultValue } : {}),
        ...(tabs.orientation === 'vertical'
          ? { orientation: tabs.orientation }
          : {}),
        ...(tabs.persist && tabs.persist !== 'none'
          ? { persist: tabs.persist }
          : {}),
        ...(tabs.syncTabKey ? { syncTabKey: tabs.syncTabKey } : {}),
      }),
      children: convertNodesSerialize(tabs.children, options),
      name: TABS_KEYS.group,
      type: 'mdxJsxFlowElement',
    };
  },
};

const tabDeserialize: TMdRule['deserialize'] = (
  node,
  decoration,
  options
) => {
  const attributes = parseFlowAttributes(node.attributes);
  const label =
    typeof attributes.label === 'string' ? attributes.label.trim() : '';
  const value =
    typeof attributes.value === 'string' ? attributes.value.trim() : '';
  const anchorId =
    typeof attributes.id === 'string' ? attributes.id.trim() : '';
  const icon = isTabIcon(attributes.icon) ? attributes.icon : undefined;
  const children = stepContentChildren(
    convertChildrenDeserialize(node.children, decoration, options),
    getPluginType(options.editor, KEYS.p)
  );

  return {
    ...(anchorId ? { anchorId } : {}),
    children:
      children.length > 0
        ? children
        : [
            {
              children: [{ text: '' }],
              type: getPluginType(options.editor, KEYS.p),
            },
          ],
    ...(icon ? { icon } : {}),
    label,
    type: getPluginType(options.editor, TABS_KEYS.item),
    value,
  };
};

const tabRule: TMdRule = {
  deserialize: tabDeserialize,
  serialize: (node, options) => {
    const tab = node as TTabElement;
    const attributes = propsToAttributes({
      ...(tab.anchorId ? { id: tab.anchorId } : {}),
      label: tab.label,
      value: tab.value,
    });

    if (tab.icon) {
      attributes.push({
        name: 'icon',
        type: 'mdxJsxAttribute',
        value: {
          type: 'mdxJsxAttributeValueExpression',
          value: JSON.stringify(tab.icon),
        },
      });
    }

    return {
      attributes,
      children: convertNodesSerialize(tab.children, options),
      name: TABS_KEYS.item,
      type: 'mdxJsxFlowElement',
    };
  },
};

const codeHighlightLines = (value: unknown): number[] => {
  if (!Array.isArray(value)) return [];

  return value
    .filter(
      (line): line is number =>
        typeof line === 'number' && Number.isInteger(line) && line > 0
    )
    .sort((left, right) => left - right);
};

const codeBlockRule: TMdRule = {
  deserialize: (node, _decoration, options) => {
    const rawLanguage = typeof node.lang === 'string' ? node.lang : undefined;
    const metadata = rawLanguage?.trim().match(/^([^\s{}]+)\{([^}]+)\}$/);
    const highlights = metadata
      ? metadata[2]
          .split(',')
          .flatMap((part: string) => {
            const range = part.trim().match(/^(\d+)(?:-(\d+))?$/);
            if (!range) return [];
            const start = Number(range[1]);
            const end = Number(range[2] ?? range[1]);
            if (start < 1 || end < start || end - start > 1_000) return [];

            return Array.from({ length: end - start + 1 }, (_, index) => start + index);
          })
          .filter((line: number, index: number, lines: number[]) => lines.indexOf(line) === index)
          .sort((left: number, right: number) => left - right)
      : [];
    const highlighted = new Set(highlights);

    return {
      children: (node.value || '').split('\n').map((line: string, index: number) => ({
        children: [{ text: line }],
        ...(highlighted.has(index + 1) ? { highlighted: true } : {}),
        type: getPluginType(options.editor, KEYS.codeLine),
      })),
      ...(highlights.length > 0 ? { highlightLines: highlights } : {}),
      lang: metadata?.[1] ?? rawLanguage,
      type: getPluginType(options.editor, KEYS.codeBlock),
    };
  },
  serialize: (node) => {
    const highlights = codeHighlightLines(node.highlightLines);
    const language = typeof node.lang === 'string' ? node.lang.trim() : '';

    return {
      lang:
        language && highlights.length > 0
          ? `${language}{${highlights.join(',')}}`
          : language || undefined,
      type: 'code',
      value: node.children
        .map((child: TElement | TText) =>
          'children' in child
            ? child.children.map((text: TText) => text.text).join('')
            : child.text
        )
        .join('\n'),
    };
  },
};

const markdownRules: MdRules = {
  [ACCORDION_KEYS.content]: portableFlowElement(ACCORDION_KEYS.content),
  [ACCORDION_KEYS.group]: portableFlowElement(ACCORDION_KEYS.group),
  [ACCORDION_KEYS.item]: portableFlowElement(ACCORDION_KEYS.item),
  [ACCORDION_KEYS.title]: portableFlowElement(ACCORDION_KEYS.title),
  [CODE_GROUP_KEYS.group]: portableExpressionFlowElement(CODE_GROUP_KEYS.group),
  [CODE_GROUP_KEYS.item]: portableExpressionFlowElement(CODE_GROUP_KEYS.item),
  [KEYS.codeBlock]: codeBlockRule,
  [KEYS.callout]: portableFlowElement('callout'),
  [KEYS.toggle]: portableFlowElement('toggle'),
  [STEPS_KEYS.group]: stepsRule,
  [STEPS_KEYS.item]: stepRule,
  [TABS_KEYS.group]: tabsRule,
  [TABS_KEYS.item]: tabRule,
  Steps: { deserialize: stepsDeserialize },
  Step: { deserialize: stepDeserialize },
};

export const MarkdownKit = [
  MarkdownPlugin.configure({
    options: {
      remarkPlugins: [
        remarkGfm,
        remarkMdx,
        createRemarkTabsPlugin({ diagnostics: [], source: 'groupher' }),
        remarkMention,
      ],
      rules: markdownRules,
    },
  }),
];
