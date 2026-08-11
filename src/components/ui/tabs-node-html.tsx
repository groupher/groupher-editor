import type { SlateElementProps } from 'platejs/static';
import { SlateElement } from 'platejs/static';

import { cn } from '@/lib/utils';
import type { TTabsElement } from '@/tabs';

export function TabsElementHtml({
  className,
  ...props
}: SlateElementProps<TTabsElement>) {
  return (
    <SlateElement
      {...props}
      className={cn(
        'rich-editor-tabs-fallback my-4 overflow-hidden rounded-xl border border-border bg-card',
        className
      )}
    />
  );
}
