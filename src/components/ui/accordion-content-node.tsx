'use client';

import type { PlateElementProps } from 'platejs/react';

import { PlateElement } from 'platejs/react';

export function AccordionContentElement(props: PlateElementProps) {
  return (
    <PlateElement
      {...props}
      className="border-t border-border px-4 py-3 text-foreground"
    />
  );
}
