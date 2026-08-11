import type { SlateElementProps } from 'platejs/static';

import { SlateElement } from 'platejs/static';

import type { TCodeGroupItemElement } from '@/code-group';

export function CodeGroupItemElementStatic(
  props: SlateElementProps<TCodeGroupItemElement>
) {
  return (
    <SlateElement
      {...props}
      attributes={{
        ...props.attributes,
        'data-slate-code-group-index': props.element.codeGroupIndex,
      }}
      className="rich-editor-code-group-item"
    />
  );
}
