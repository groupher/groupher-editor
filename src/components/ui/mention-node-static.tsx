import type { SlateElementProps } from 'platejs/static';

import { SlateElement } from 'platejs/static';

export function MentionElementStatic({ element, ...props }: SlateElementProps) {
  const value = typeof element.value === 'string' ? element.value : 'unknown';

  return (
    <SlateElement
      {...props}
      element={element}
      as="span"
      className="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold"
      contentEditable={false}
    >
      @{value}
      {props.children}
    </SlateElement>
  );
}
