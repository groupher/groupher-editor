import type { SlateElementProps } from 'platejs/static';

import { SlateElement } from 'platejs/static';

export function AccordionContentElementStatic(props: SlateElementProps) {
  return (
    <SlateElement
      {...props}
      className="border-t border-border px-4 py-3 text-foreground"
    />
  );
}
