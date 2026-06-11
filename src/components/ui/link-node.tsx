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
      asChild
      className={cn('text-brand underline decoration-brand/60 underline-offset-2')}
    >
      <a href={url} rel="noreferrer" target="_blank">
        {children}
      </a>
    </PlateElement>
  );
}
