import type { SlateElementProps } from 'platejs/static';

import { SlateElement } from 'platejs/static';

export function AccordionElementStatic(props: SlateElementProps) {
  return <SlateElement {...props} as="details" />;
}
