'use client';

import { Fragment, type CSSProperties } from 'react';
import type { PlateElementProps } from 'platejs/react';

import { PlateElement } from 'platejs/react';

import {
  getCodeGroupDomId,
  getCodeGroupItemLabel,
  type TCodeGroupElement,
} from '@/code-group';
import { cn } from '@/lib/utils';

type TCodeGroupStyle = CSSProperties & {
  '--rich-editor-code-group-tabs': number;
};

export function CodeGroupElement({
  className,
  ...props
}: PlateElementProps<TCodeGroupElement>) {
  const groupId = getCodeGroupDomId(props.element);
  const style: TCodeGroupStyle = {
    '--rich-editor-code-group-tabs': Math.max(1, props.element.children.length),
  };
  const panelRules = props.element.children
    .map(
      (_item, index) =>
        `#${groupId}-${index}:checked ~ [data-slate-code-group-index="${index}"] { display: block; }`
    )
    .join('\n');

  return (
    <PlateElement
      {...props}
      className={cn('rich-editor-code-group', className)}
      style={style}
    >
      {props.element.children.map((item, index) => {
        const inputId = `${groupId}-${index}`;
        const label = getCodeGroupItemLabel(item, index);

        return (
          <Fragment key={inputId}>
            <input
              aria-label={label}
              className="rich-editor-code-group-input"
              contentEditable={false}
              defaultChecked={index === 0}
              id={inputId}
              name={groupId}
              type="radio"
            />
            <label
              className="rich-editor-code-group-tab"
              contentEditable={false}
              htmlFor={inputId}
              onMouseDown={(event) => event.stopPropagation()}
            >
              {label}
            </label>
          </Fragment>
        );
      })}
      {props.children}
      <style contentEditable={false}>{panelRules}</style>
    </PlateElement>
  );
}
