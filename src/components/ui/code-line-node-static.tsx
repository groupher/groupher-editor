import type { SlateElementProps } from 'platejs/static';

import { SlateElement } from 'platejs/static';

import { cn } from '@/lib/utils';

export function CodeLineElementStatic({
  className,
  ...props
}: SlateElementProps) {
  return (
    <SlateElement
      {...props}
      className={cn(
        props.element.highlighted && 'rich-editor-code-line-highlighted',
        className
      )}
    />
  );
}
