'use client';

import * as React from 'react';

import type { PlateElementProps } from 'platejs/react';

import { PlateElement } from 'platejs/react';

import { cn } from '@/lib/utils';

export function CalloutElement(props: PlateElementProps) {
  return (
    <PlateElement
      {...props}
      className={cn(
        'my-3 flex gap-3 rounded-lg border border-brand/30 bg-brand/5 px-3 py-2 text-sm text-foreground'
      )}
    >
      <span className="mt-1 text-lg">💡</span>
      <div className="min-w-0 flex-1">{props.children}</div>
    </PlateElement>
  );
}
