import type { SlateElementProps } from 'platejs/static';

import { SlateElement } from 'platejs/static';

export function StepTitleElementStatic(props: SlateElementProps) {
  return (
    <SlateElement
      {...props}
      as="span"
      className="rich-editor-step-title"
    />
  );
}
