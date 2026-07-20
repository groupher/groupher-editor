import {
  BaseTableCellHeaderPlugin,
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from '@platejs/table';

import { TableCellHeaderElementStatic } from '@/components/ui/table-cell-header-node-static';
import { TableCellElementStatic } from '@/components/ui/table-cell-node-static';
import { TableElementStatic } from '@/components/ui/table-node-static';
import { TableRowElementStatic } from '@/components/ui/table-row-node-static';

export const BaseTableKit = [
  BaseTablePlugin.withComponent(TableElementStatic),
  BaseTableRowPlugin.withComponent(TableRowElementStatic),
  BaseTableCellPlugin.withComponent(TableCellElementStatic),
  BaseTableCellHeaderPlugin.withComponent(TableCellHeaderElementStatic),
];
