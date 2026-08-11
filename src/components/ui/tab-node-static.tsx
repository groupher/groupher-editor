'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import type { SlateElementProps } from 'platejs/static';
import { SlateElement } from 'platejs/static';

import { cn } from '@/lib/utils';
import type { TTabElement } from '@/tabs';

export function TabElementStatic({
  className,
  ...props
}: SlateElementProps<TTabElement>) {
  return (
    <TabsPrimitive.Content
      className="rich-editor-tab-panel min-w-0 p-4 outline-none data-[state=inactive]:hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/50"
      forceMount
      value={props.element.value}
    >
      <SlateElement
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
