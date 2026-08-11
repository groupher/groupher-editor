'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import type { SlateElementProps } from 'platejs/static';
import { SlateElement } from 'platejs/static';

import { TabIcon } from '@/components/ui/tab-icon';
import { useSyncedTabValue } from '@/components/ui/tabs-sync-provider';
import { cn } from '@/lib/utils';
import {
  getTabsInitialValue,
  getTabValue,
  type TTabsElement,
} from '@/tabs';

export function TabsElementStatic({
  className,
  ...props
}: SlateElementProps<TTabsElement>) {
  const tabs = props.element;
  const orientation =
    tabs.orientation === 'vertical' ? 'vertical' : 'horizontal';
  const availableValues = tabs.children.map(getTabValue);
  const syncTabKey =
    typeof tabs.syncTabKey === 'string' && tabs.syncTabKey.trim()
      ? tabs.syncTabKey.trim()
      : undefined;
  const { setValue, value } = useSyncedTabValue({
    availableValues,
    fallbackValue: getTabsInitialValue(tabs),
    persist: tabs.persist,
    syncTabKey,
  });

  return (
    <TabsPrimitive.Root
      activationMode="automatic"
      className="contents"
      orientation={orientation}
      value={value}
      onValueChange={setValue}
    >
      <SlateElement
        {...props}
        className={cn(
          'rich-editor-tabs my-4 overflow-hidden rounded-xl border border-border bg-card',
          orientation === 'vertical' &&
            'grid grid-cols-[minmax(8rem,auto)_minmax(0,1fr)]',
          className
        )}
      >
        <div
          className={cn(
            'rich-editor-tabs-header flex min-w-0 items-center border-border bg-muted/30',
            orientation === 'horizontal'
              ? 'border-b'
              : 'flex-col border-r'
          )}
        >
          <TabsPrimitive.List
            aria-label="Tabs"
            className={cn(
              'flex min-w-0 flex-1 gap-1 overflow-auto p-1',
              orientation === 'vertical' && 'w-full flex-col'
            )}
            loop
          >
            {tabs.children.map((tab, index) => {
              const tabValue = availableValues[index];

              return (
                <TabsPrimitive.Trigger
                  className={cn(
                    'inline-flex min-h-8 min-w-0 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground outline-none transition-colors',
                    'hover:bg-background/70 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50',
                    'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
                    orientation === 'vertical' && 'w-full justify-start'
                  )}
                  key={tabValue}
                  value={tabValue}
                >
                  <TabIcon icon={tab.icon} />
                  <span className="truncate">{tab.label}</span>
                </TabsPrimitive.Trigger>
              );
            })}
          </TabsPrimitive.List>
        </div>
        {props.children}
      </SlateElement>
    </TabsPrimitive.Root>
  );
}
