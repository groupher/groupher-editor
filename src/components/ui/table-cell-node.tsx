'use client';

import type { TTableCellElement } from 'platejs';
import type { PlateElementProps } from 'platejs/react';

import { PlateElement } from 'platejs/react';

import { cn } from '@/lib/utils';

type TTableCellElementProps = PlateElementProps<TTableCellElement> & {
  isHeader?: boolean;
};

export function TableCellElement({
  className,
  isHeader = false,
  ...props
}: TTableCellElementProps) {
  const { colSpan, rowSpan } = props.element;

  return (
    <PlateElement
      {...props}
      as={isHeader ? 'th' : 'td'}
      attributes={{
        ...props.attributes,
        colSpan: typeof colSpan === 'number' ? colSpan : undefined,
        rowSpan: typeof rowSpan === 'number' ? rowSpan : undefined,
      }}
      className={cn(
        'border border-border p-2 align-top',
        isHeader && 'bg-muted text-left font-semibold',
        className
      )}
    />
  );
}
