import type { SlateElementProps } from 'platejs/static';

import { SlateElement } from 'platejs/static';

export function ToggleElementStatic({ element, ...props }: SlateElementProps) {
  return (
    <SlateElement {...props} element={element}>
      <details open={element.collapsed !== true}>
        <summary>{props.children}</summary>
      </details>
    </SlateElement>
  );
}
