import * as React from 'react';

import type { SlateElementProps } from 'platejs/static';

import { SlateElement } from 'platejs/static';

import { cn } from '@/lib/utils';

type TStepElement = {
  anchorId?: string;
  noAnchor?: boolean;
  stepNumber?: number;
  titleSize?: string;
};

export function StepElementStatic({ children, ...props }: SlateElementProps) {
  const element = props.element as TStepElement;
  const anchorId = element.noAnchor ? undefined : element.anchorId;
  const stepNumber = Number.isFinite(element.stepNumber)
    ? element.stepNumber
    : undefined;
  const titleSize = ['h2', 'h3', 'h4'].includes(element.titleSize ?? '')
    ? element.titleSize
    : undefined;
  const childArray = React.Children.toArray(children);
  const [title, ...content] = childArray;

  return (
    <SlateElement
      {...props}
      as="li"
      className={cn(
        'rich-editor-step',
        titleSize && `rich-editor-step-title-${titleSize}`
      )}
      id={anchorId}
    >
      <details className="rich-editor-step-details" open>
        <summary className="rich-editor-step-heading">
          <span aria-hidden="true" className="rich-editor-step-marker">
            {stepNumber}
          </span>
          <span className="rich-editor-step-title-row">
            {title}
            <span
              aria-hidden="true"
              className="rich-editor-step-collapse-pill"
            >
              ...
            </span>
          </span>
        </summary>
        {content}
      </details>
    </SlateElement>
  );
}
