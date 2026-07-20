'use client';

import {
  TableCellHeaderPlugin,
  TableCellPlugin,
  TablePlugin,
  TableRowPlugin,
} from '@platejs/table/react';

import { TableCellHeaderElement } from '@/components/ui/table-cell-header-node';
import { TableCellElement } from '@/components/ui/table-cell-node';
import { TableElement } from '@/components/ui/table-node';
import { TableRowElement } from '@/components/ui/table-row-node';

export const TableKit = [
  TablePlugin.withComponent(TableElement),
  TableRowPlugin.withComponent(TableRowElement),
  TableCellPlugin.withComponent(TableCellElement),
  TableCellHeaderPlugin.withComponent(TableCellHeaderElement),
];
