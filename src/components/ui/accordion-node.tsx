'use client';

import type { PlateElementProps } from 'platejs/react';

import { PlateElement } from 'platejs/react';

export function AccordionElement(props: PlateElementProps) {
  return <PlateElement {...props} as="details" />;
}
