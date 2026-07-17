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

const portableFlowElement = (
  name: 'callout' | 'toggle'
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
