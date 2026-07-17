import { BaseListPlugin } from '@platejs/list';
import { KEYS } from 'platejs';

import { BlockListStatic } from '@/components/ui/block-list-static';

export const BaseListKit = [
  BaseListPlugin.configure({
    inject: {
      targetPlugins: [...KEYS.heading, KEYS.p, KEYS.blockquote, KEYS.toggle],
    },
    render: {
      belowNodes: (props) => {
        if (!props.element.listStyleType) return;

        return (wrapperProps) => <BlockListStatic {...wrapperProps} />;
      },
    },
  }),
];
