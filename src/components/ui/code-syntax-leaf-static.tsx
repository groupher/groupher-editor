import type { SlateLeafProps } from 'platejs/static';

import { SlateLeaf } from 'platejs/static';

export function CodeSyntaxLeafStatic(props: SlateLeafProps) {
  const tokenClassName = props.leaf.className as string | undefined;

  return <SlateLeaf className={tokenClassName} {...props} />;
}
