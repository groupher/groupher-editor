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
import { extractNodeText } from '@/node/text';
import { STEPS_KEYS } from '@/steps';

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

const markdownRules: MdRules = {
  [ACCORDION_KEYS.content]: portableFlowElement(ACCORDION_KEYS.content),
  [ACCORDION_KEYS.group]: portableFlowElement(ACCORDION_KEYS.group),
  [ACCORDION_KEYS.item]: portableFlowElement(ACCORDION_KEYS.item),
  [ACCORDION_KEYS.title]: portableFlowElement(ACCORDION_KEYS.title),
  [KEYS.callout]: portableFlowElement('callout'),
  [KEYS.toggle]: portableFlowElement('toggle'),
  [STEPS_KEYS.group]: stepsRule,
  [STEPS_KEYS.item]: stepRule,
  Steps: { deserialize: stepsDeserialize },
  Step: { deserialize: stepDeserialize },
};

export const MarkdownKit = [
  MarkdownPlugin.configure({
    options: {
      remarkPlugins: [remarkGfm, remarkMdx, remarkMention],
      rules: markdownRules,
    },
  }),
];
