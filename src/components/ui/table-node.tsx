'use client';

import type { TTableElement } from 'platejs';
import type { PlateElementProps } from 'platejs/react';

import { PlateElement } from 'platejs/react';

import { cn } from '@/lib/utils';

export function TableElement({
  children,
  className,
  ...props
}: PlateElementProps<TTableElement>) {
  return (
    <PlateElement className={cn('my-4 overflow-x-auto', className)} {...props}>
      <table className="w-full border-collapse">
        <tbody>{children}</tbody>
      </table>
    </PlateElement>
  );
}
