'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import type { PlateElementProps } from 'platejs/react';
import { PlateElement } from 'platejs/react';

import { cn } from '@/lib/utils';
import type { TTabElement } from '@/tabs';

export function TabElement({
  className,
  ...props
}: PlateElementProps<TTabElement>) {
  return (
    <TabsPrimitive.Content
      className="rich-editor-tab-panel min-w-0 p-4 outline-none data-[state=inactive]:hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/50"
      forceMount
      value={props.element.value}
    >
      <PlateElement
        {...props}
        attributes={{
          ...props.attributes,
          id: props.element.anchorId,
        }}
        className={cn('min-w-0', className)}
      />
    </TabsPrimitive.Content>
  );
}
