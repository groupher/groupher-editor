'use client';

import type { TTableCellElement } from 'platejs';
import type { PlateElementProps } from 'platejs/react';

import { TableCellElement } from '@/components/ui/table-cell-node';

export function TableCellHeaderElement(
  props: PlateElementProps<TTableCellElement>
) {
  return <TableCellElement {...props} isHeader />;
}
