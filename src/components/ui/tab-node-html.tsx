import type { SlateElementProps } from 'platejs/static';
import { SlateElement } from 'platejs/static';

import { TabIcon } from '@/components/ui/tab-icon';
import { cn } from '@/lib/utils';
import type { TTabElement } from '@/tabs';

export function TabElementHtml({
  className,
  ...props
}: SlateElementProps<TTabElement>) {
  return (
    <SlateElement
      {...props}
      as="section"
      attributes={{
        ...props.attributes,
        id: props.element.anchorId,
      }}
      className={cn(
        'rich-editor-tab-fallback border-t border-border first:border-t-0',
        className
      )}
    >
      <h3 className="flex items-center gap-1.5 bg-muted/30 px-4 py-2 text-sm font-semibold text-foreground">
        <TabIcon icon={props.element.icon} />
        {props.element.label}
      </h3>
      <div className="p-4">{props.children}</div>
    </SlateElement>
  );
}
