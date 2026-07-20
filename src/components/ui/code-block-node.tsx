'use client';

import type { TCodeBlockElement } from 'platejs';
import type { PlateElementProps } from 'platejs/react';

import { PlateElement } from 'platejs/react';

import { cn } from '@/lib/utils';

export function CodeBlockElement({
  className,
  ...props
}: PlateElementProps<TCodeBlockElement>) {
  const language = props.element.lang?.trim();

  return (
    <PlateElement className={cn('relative my-4', className)} {...props}>
      {language && (
        <span
          className="absolute top-2 right-3 select-none text-muted-foreground text-xs"
          contentEditable={false}
        >
          {language}
        </span>
      )}
      <pre className="overflow-x-auto rounded-md bg-muted p-4 pr-16 font-mono text-sm">
        <code>{props.children}</code>
      </pre>
    </PlateElement>
  );
}
