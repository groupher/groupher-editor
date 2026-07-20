'use client';

import type { PlateElementProps } from 'platejs/react';

import { PlateElement } from 'platejs/react';

export function AccordionGroupElement(props: PlateElementProps) {
  return (
    <PlateElement
      {...props}
      className="my-4 divide-y divide-border overflow-hidden rounded-lg border border-border bg-background"
    >
      {props.children}
    </PlateElement>
  );
}
