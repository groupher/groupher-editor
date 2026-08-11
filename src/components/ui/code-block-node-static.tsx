import type { TCodeBlockElement } from 'platejs';
import type { SlateElementProps } from 'platejs/static';

import { SlateElement } from 'platejs/static';

import { getCodeBlockLanguageLabel } from '@/code-block';
import { cn } from '@/lib/utils';

export function CodeBlockElementStatic({
  className,
  ...props
}: SlateElementProps<TCodeBlockElement>) {
  const language = getCodeBlockLanguageLabel(props.element.lang);

  return (
    <SlateElement
      className={cn('rich-editor-code-block relative my-4', className)}
      {...props}
    >
      {language && (
        <span className="rich-editor-code-language absolute top-2 right-3 text-muted-foreground text-xs">
          {language}
        </span>
      )}
      <pre className="overflow-x-auto rounded-md bg-muted p-4 pr-24 font-mono text-sm">
        <code>{props.children}</code>
      </pre>
    </SlateElement>
  );
}
