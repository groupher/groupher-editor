'use client';

import type { PlateElementProps } from 'platejs/react';

import { PlateElement } from 'platejs/react';

export function AccordionTitleElement(props: PlateElementProps) {
  return (
    <PlateElement
      {...props}
      as="summary"
      className="cursor-pointer px-4 py-3 font-medium text-foreground"
    />
  );
}
