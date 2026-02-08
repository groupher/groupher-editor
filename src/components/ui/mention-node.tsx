'use client';

import * as React from 'react';

import type { PlateElementProps } from 'platejs/react';

import { PlateElement } from 'platejs/react';

import { cn } from '@/lib/utils';

export function MentionElement({ element, ...props }: PlateElementProps) {
  const value = (element as { value?: string }).value ?? 'unknown';

  return (
    <PlateElement
      {...props}
      asChild
      className={cn('inline-flex rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand')}
      contentEditable={false}
    >
      <span>@{value}</span>
    </PlateElement>
  );
}
