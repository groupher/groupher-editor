'use client';

import type { PlateElementProps } from 'platejs/react';

import { PlateElement } from 'platejs/react';

export function TableRowElement(props: PlateElementProps) {
  return <PlateElement {...props} as="tr" />;
}
