'use client';

import * as React from 'react';

import type { PlateElementProps } from 'platejs/react';

import { PlateElement } from 'platejs/react';

import { cn } from '@/lib/utils';

type TStepElement = {
  anchorId?: string;
  noAnchor?: boolean;
  stepNumber?: number;
  titleSize?: string;
};

export function StepElement({ children, ...props }: PlateElementProps) {
  const element = props.element as TStepElement;
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const titleClickTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const anchorId = element.noAnchor ? undefined : element.anchorId;
  const stepNumber = Number.isFinite(element.stepNumber)
    ? element.stepNumber
    : undefined;
  const titleSize = ['h2', 'h3', 'h4'].includes(element.titleSize ?? '')
    ? element.titleSize
    : undefined;
  const childArray = React.Children.toArray(children);
  const [title, ...content] = childArray;

  React.useEffect(
    () => () => {
      if (titleClickTimerRef.current) {
        clearTimeout(titleClickTimerRef.current);
      }
    },
    []
  );

  const toggleCollapsed = () => setIsCollapsed((collapsed) => !collapsed);

  const handleTitleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.detail !== 1 || window.getSelection()?.isCollapsed === false) {
      return;
    }

    if (titleClickTimerRef.current) {
      clearTimeout(titleClickTimerRef.current);
    }

    titleClickTimerRef.current = setTimeout(() => {
      toggleCollapsed();
      titleClickTimerRef.current = null;
    }, 180);
  };

  const handleTitleDoubleClick = () => {
    if (!titleClickTimerRef.current) return;

    clearTimeout(titleClickTimerRef.current);
    titleClickTimerRef.current = null;
  };

  return (
    <PlateElement
      {...props}
      as="li"
      className={cn(
        'rich-editor-step',
        isCollapsed && 'rich-editor-step-collapsed',
        titleSize && `rich-editor-step-title-${titleSize}`
      )}
      id={anchorId}
    >
      <div className="rich-editor-step-details">
        <div
          className="rich-editor-step-heading"
          onClick={handleTitleClick}
          onDoubleClick={handleTitleDoubleClick}
        >
          <button
            type="button"
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? 'Expand step' : 'Collapse step'}
            className="rich-editor-step-marker"
            contentEditable={false}
            onClick={(event) => {
              event.stopPropagation();
              toggleCollapsed();
            }}
          >
            {stepNumber}
          </button>
          <div className="rich-editor-step-title-row">
            {title}
            <span
              aria-hidden="true"
              className="rich-editor-step-collapse-pill"
              contentEditable={false}
            >
              ...
            </span>
          </div>
        </div>
        {content}
      </div>
    </PlateElement>
  );
}
