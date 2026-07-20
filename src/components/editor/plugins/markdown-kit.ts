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
import { getPluginType, KEYS } from 'platejs';
import remarkGfm from 'remark-gfm';

import { ACCORDION_KEYS } from '@/accordion';

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

const markdownRules: MdRules = {
  [ACCORDION_KEYS.content]: portableFlowElement(ACCORDION_KEYS.content),
  [ACCORDION_KEYS.group]: portableFlowElement(ACCORDION_KEYS.group),
  [ACCORDION_KEYS.item]: portableFlowElement(ACCORDION_KEYS.item),
  [ACCORDION_KEYS.title]: portableFlowElement(ACCORDION_KEYS.title),
  [KEYS.callout]: portableFlowElement('callout'),
  [KEYS.toggle]: portableFlowElement('toggle'),
};

export const MarkdownKit = [
  MarkdownPlugin.configure({
    options: {
      remarkPlugins: [remarkGfm, remarkMdx, remarkMention],
      rules: markdownRules,
    },
  }),
];
