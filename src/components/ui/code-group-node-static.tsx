import { Fragment, type CSSProperties } from 'react';
import type { SlateElementProps } from 'platejs/static';

import { SlateElement } from 'platejs/static';

import {
  getCodeGroupDomId,
  getCodeGroupItemLabel,
  type TCodeGroupElement,
} from '@/code-group';
import { cn } from '@/lib/utils';

type TCodeGroupStyle = CSSProperties & {
  '--rich-editor-code-group-tabs': number;
};

export function CodeGroupElementStatic({
  className,
  ...props
}: SlateElementProps<TCodeGroupElement>) {
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
    <SlateElement
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
              defaultChecked={index === 0}
              id={inputId}
              name={groupId}
              type="radio"
            />
            <label
              className="rich-editor-code-group-tab"
              htmlFor={inputId}
            >
              {label}
            </label>
          </Fragment>
        );
      })}
      {props.children}
      <style>{panelRules}</style>
    </SlateElement>
  );
}
