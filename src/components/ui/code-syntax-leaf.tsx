'use client';

import type { PlateLeafProps } from 'platejs/react';

import { PlateLeaf } from 'platejs/react';

export function CodeSyntaxLeaf(props: PlateLeafProps) {
  const tokenClassName = props.leaf.className as string | undefined;

  return <PlateLeaf className={tokenClassName} {...props} />;
}
