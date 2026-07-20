import type { SlateElementProps } from 'platejs/static';

import { SlateElement } from 'platejs/static';

export function StepContentElementStatic(props: SlateElementProps) {
  return <SlateElement {...props} className="rich-editor-step-content" />;
}
