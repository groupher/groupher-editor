'use client';

import type { PlateElementProps } from 'platejs/react';

import { PlateElement } from 'platejs/react';

import { cn } from '@/lib/utils';

type TStepsElement = {
  titleSize?: string;
};

export function StepsElement(props: PlateElementProps) {
  const element = props.element as TStepsElement;
  const titleSize = ['h2', 'h3', 'h4'].includes(element.titleSize ?? '')
    ? element.titleSize
    : undefined;

  return (
    <PlateElement
      {...props}
      as="ol"
      className={cn(
        'rich-editor-steps',
        titleSize && `rich-editor-steps-title-${titleSize}`
      )}
    />
  );
}
