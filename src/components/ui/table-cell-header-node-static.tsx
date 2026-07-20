import type { TTableCellElement } from 'platejs';
import type { SlateElementProps } from 'platejs/static';

import { TableCellElementStatic } from '@/components/ui/table-cell-node-static';

export function TableCellHeaderElementStatic(
  props: SlateElementProps<TTableCellElement>
) {
  return <TableCellElementStatic {...props} isHeader />;
}
