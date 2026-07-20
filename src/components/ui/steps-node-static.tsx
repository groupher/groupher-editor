import type { SlateElementProps } from 'platejs/static';

import { SlateElement } from 'platejs/static';

import { cn } from '@/lib/utils';

type TStepsElement = {
  titleSize?: string;
};

export function StepsElementStatic(props: SlateElementProps) {
  const element = props.element as TStepsElement;
  const titleSize = ['h2', 'h3', 'h4'].includes(element.titleSize ?? '')
    ? element.titleSize
    : undefined;

  return (
    <SlateElement
      {...props}
      as="ol"
      className={cn(
        'rich-editor-steps',
        titleSize && `rich-editor-steps-title-${titleSize}`
      )}
    />
  );
}
