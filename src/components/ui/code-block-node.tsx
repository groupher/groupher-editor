'use client';

import type { TCodeBlockElement } from 'platejs';
import type { PlateElementProps } from 'platejs/react';

import { PlateElement } from 'platejs/react';

import { CodeBlockLanguageSelect } from '@/components/ui/code-block-language-select';
import { cn } from '@/lib/utils';

export function CodeBlockElement({
  className,
  ...props
}: PlateElementProps<TCodeBlockElement>) {
  return (
    <PlateElement
      className={cn('rich-editor-code-block relative my-4', className)}
      {...props}
    >
      <div
        className="rich-editor-code-language absolute top-2 right-2 z-10 select-none"
        contentEditable={false}
      >
        <CodeBlockLanguageSelect />
      </div>
      <pre className="overflow-x-auto rounded-md bg-muted p-4 pr-24 font-mono text-sm">
        <code>{props.children}</code>
      </pre>
    </PlateElement>
  );
}
