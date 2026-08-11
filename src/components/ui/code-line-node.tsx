'use client';

import type { PlateElementProps } from 'platejs/react';

import { PlateElement } from 'platejs/react';

import { cn } from '@/lib/utils';

export function CodeLineElement({ className, ...props }: PlateElementProps) {
  return (
    <PlateElement
      {...props}
      className={cn(
        props.element.highlighted && 'rich-editor-code-line-highlighted',
        className
      )}
    />
  );
}
