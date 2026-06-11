'use client';

import * as React from 'react';

import type { PlateElementProps } from 'platejs/react';

import { PlateElement, useEditorRef, useEditorReadOnly } from 'platejs/react';
import { Transforms } from 'platejs';

import { cn } from '@/lib/utils';

export function TodoListItemElement({ element, children, ...props }: PlateElementProps) {
  const editor = useEditorRef();
  const readOnly = useEditorReadOnly();
  const checked = Boolean((element as { checked?: boolean }).checked);

  return (
    <PlateElement
      {...props}
      className={cn('my-1 flex items-start gap-2 rounded-md px-1 py-1')}
    >
      <input
        type="checkbox"
        className="mt-1 size-4"
        checked={checked}
        disabled={readOnly}
        onChange={() => {
          if (readOnly) return;
          Transforms.setNodes(
            editor,
            { checked: !checked },
            {
              at: editor.selection ?? undefined,
              match: (node) =>
                !('text' in node) &&
                (node as { type?: string }).type === 'todo-list-item',
            }
          );
        }}
      />
      <div className={cn('min-w-0 flex-1', checked && 'opacity-60 line-through')}>
        {children}
      </div>
    </PlateElement>
  );
}
