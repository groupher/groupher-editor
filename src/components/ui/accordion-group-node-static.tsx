import type { SlateElementProps } from 'platejs/static';

import { SlateElement } from 'platejs/static';

export function AccordionGroupElementStatic(props: SlateElementProps) {
  return (
    <SlateElement
      {...props}
      className="my-4 divide-y divide-border overflow-hidden rounded-lg border border-border bg-background"
    />
  );
}
