'use client';

import type { PlateElementProps } from 'platejs/react';

import { PlateElement } from 'platejs/react';

export function StepTitleElement(props: PlateElementProps) {
  return <PlateElement {...props} className="rich-editor-step-title" />;
}
