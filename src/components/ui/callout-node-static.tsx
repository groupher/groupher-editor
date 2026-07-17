import type { SlateElementProps } from 'platejs/static';

import { SlateElement } from 'platejs/static';

export function CalloutElementStatic({ element, ...props }: SlateElementProps) {
  const icon = typeof element.icon === 'string' ? element.icon : '💡';

  return (
    <SlateElement
      {...props}
      element={element}
      className="my-3 flex gap-3 rounded-lg border px-3 py-2 text-sm"
    >
      <span aria-hidden="true">{icon}</span>
      <div>{props.children}</div>
    </SlateElement>
  );
}
