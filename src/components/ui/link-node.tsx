'use client';

import * as React from 'react';

import type { PlateElementProps } from 'platejs/react';

import { PlateElement } from 'platejs/react';

import { cn } from '@/lib/utils';

export function LinkElement({ element, children, ...props }: PlateElementProps) {
  const url = (element as { url?: string }).url ?? '#';

  return (
    <PlateElement
      {...props}
      element={element}
      as="a"
      href={url}
      rel="noreferrer"
      target="_blank"
      className={cn('text-brand underline decoration-brand/60 underline-offset-2')}
    >
      {children}
    </PlateElement>
  );
}
