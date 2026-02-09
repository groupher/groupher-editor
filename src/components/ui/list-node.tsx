'use client';

import * as React from 'react';

import type { PlateElementProps } from 'platejs/react';

import { PlateElement } from 'platejs/react';

import { cn } from '@/lib/utils';

export function BulletedListElement(props: PlateElementProps) {
  return (
    <PlateElement
      {...props}
      asChild
      className={cn('my-3 ml-6 list-disc space-y-1')}
    >
      <ul>{props.children}</ul>
    </PlateElement>
  );
}

export function NumberedListElement(props: PlateElementProps) {
  return (
    <PlateElement
      {...props}
      asChild
      className={cn('my-3 ml-6 list-decimal space-y-1')}
    >
      <ol>{props.children}</ol>
    </PlateElement>
  );
}

export function ListItemElement(props: PlateElementProps) {
  return (
    <PlateElement {...props} asChild className={cn('pl-1')}>
      <li>{props.children}</li>
    </PlateElement>
  );
}
