import type { TTableCellElement } from 'platejs';
import type { SlateElementProps } from 'platejs/static';

import { SlateElement } from 'platejs/static';

import { cn } from '@/lib/utils';

type TTableCellElementStaticProps = SlateElementProps<TTableCellElement> & {
  isHeader?: boolean;
};

export function TableCellElementStatic({
  className,
  isHeader = false,
  ...props
}: TTableCellElementStaticProps) {
  const { colSpan, rowSpan } = props.element;

  return (
    <SlateElement
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
