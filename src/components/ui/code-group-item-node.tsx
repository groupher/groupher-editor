'use client';

import type { PlateElementProps } from 'platejs/react';

import { PlateElement } from 'platejs/react';

import type { TCodeGroupItemElement } from '@/code-group';

export function CodeGroupItemElement(
  props: PlateElementProps<TCodeGroupItemElement>
) {
  return (
    <PlateElement
      {...props}
      attributes={{
        ...props.attributes,
        'data-slate-code-group-index': props.element.codeGroupIndex,
      }}
      className="rich-editor-code-group-item"
    />
  );
}
