'use client';

import * as React from 'react';

import type { PlateElementProps } from 'platejs/react';

import { PlateElement, useEditorReadOnly, useEditorRef } from 'platejs/react';

import { cn } from '@/lib/utils';

export function ToggleElement({ element, children, ...props }: PlateElementProps) {
  const editor = useEditorRef();
  const readOnly = useEditorReadOnly();
  const isCollapsed = Boolean((element as { collapsed?: boolean }).collapsed);
  const childArray = React.Children.toArray(children);
  const [title, ...rest] = childArray;

  return (
    <PlateElement
      {...props}
      element={element}
      className="my-3 rounded-md border border-border bg-muted/40"
    >
      <div className="flex items-start gap-2 px-2 py-2">
        <button
          type="button"
          className="mt-1 text-xs text-muted-foreground"
          onClick={() => {
            if (readOnly) return;
            const path = editor.api.findPath(element);
            if (!path) return;

            editor.tf.setNodes({ collapsed: !isCollapsed }, { at: path });
          }}
        >
          {isCollapsed ? '▶' : '▼'}
        </button>
        <div className={cn('flex-1', readOnly && 'cursor-default')}>{title}</div>
      </div>
      <div className={cn('px-6 pb-3', isCollapsed && 'hidden')}>{rest}</div>
    </PlateElement>
  );
}
