'use client';

import * as React from 'react';

import type { PlateElementProps } from 'platejs/react';

import { PlateElement } from 'platejs/react';

import { CalloutIcon } from '@/components/ui/callout-icon';
import {
  getCalloutPresentation,
  getCalloutTitle,
} from '@/components/ui/callout-presentation';
import { cn } from '@/lib/utils';

export function CalloutElement({ element, children, ...props }: PlateElementProps) {
  const presentation = getCalloutPresentation(element.variant);
  const title = getCalloutTitle(element.title, presentation.title);

  return (
    <PlateElement
      {...props}
      element={element}
      data-callout-variant={presentation.variant}
      className={cn(
        'my-3 rounded-md border px-4 py-3 text-sm text-foreground',
        presentation.surfaceClassName
      )}
    >
      <div className="flex items-start gap-3">
        <CalloutIcon
          className={cn('mt-0.5', presentation.accentClassName)}
          icon={element.icon}
          iconLibrary={element.iconLibrary}
          presentation={presentation}
        />
        <div className="min-w-0 flex-1">
          <div
            contentEditable={false}
            className={cn(
              'mb-1 font-medium leading-5',
              presentation.accentClassName
            )}
          >
            {title}
          </div>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </PlateElement>
  );
}
