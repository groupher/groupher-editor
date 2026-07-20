import type { SlateElementProps } from 'platejs/static';

import { SlateElement } from 'platejs/static';

export function AccordionTitleElementStatic(props: SlateElementProps) {
  return (
    <SlateElement
      {...props}
      as="summary"
      className="cursor-pointer px-4 py-3 font-medium text-foreground"
    />
  );
}
