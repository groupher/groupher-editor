import type { SlateElementProps } from 'platejs/static';

import { SlateElement } from 'platejs/static';

export function TableRowElementStatic(props: SlateElementProps) {
  return <SlateElement {...props} as="tr" />;
}
