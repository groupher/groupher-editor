import type { TCodeBlockElement } from 'platejs';
import type { SlateElementProps } from 'platejs/static';

import { SlateElement } from 'platejs/static';

import { cn } from '@/lib/utils';

export function CodeBlockElementStatic({
  className,
  ...props
}: SlateElementProps<TCodeBlockElement>) {
  const language = props.element.lang?.trim();

  return (
    <SlateElement className={cn('relative my-4', className)} {...props}>
      {language && (
        <span className="absolute top-2 right-3 text-muted-foreground text-xs">
          {language}
        </span>
      )}
      <pre className="overflow-x-auto rounded-md bg-muted p-4 pr-16 font-mono text-sm">
        <code>{props.children}</code>
      </pre>
    </SlateElement>
  );
}
