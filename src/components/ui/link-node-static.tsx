import type { SlateElementProps } from 'platejs/static';

import { SlateElement } from 'platejs/static';

export function LinkElementStatic({ element, ...props }: SlateElementProps) {
  const href = typeof element.url === 'string' ? element.url : '';
  const target = typeof element.target === 'string' ? element.target : undefined;

  return (
    <SlateElement
      {...props}
      element={element}
      as="a"
      href={href}
      rel={target === '_blank' ? 'noreferrer' : undefined}
      target={target}
    />
  );
}
