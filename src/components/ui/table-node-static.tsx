import type { TTableElement } from 'platejs';
import type { SlateElementProps } from 'platejs/static';

import { SlateElement } from 'platejs/static';

import { cn } from '@/lib/utils';

export function TableElementStatic({
  children,
  className,
  ...props
}: SlateElementProps<TTableElement>) {
  return (
    <SlateElement className={cn('my-4 overflow-x-auto', className)} {...props}>
      <table className="w-full border-collapse">
        <tbody>{children}</tbody>
      </table>
    </SlateElement>
  );
}
