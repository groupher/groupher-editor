'use client';

import type * as React from 'react';

import {
  useLinkToolbarButton,
  useLinkToolbarButtonState,
} from '@platejs/link/react';
import { Link } from 'lucide-react';

import { useI18n } from '@/i18n';

import { ToolbarButton } from './toolbar';

export function LinkToolbarButton({
  tooltip,
  ...props
}: React.ComponentProps<typeof ToolbarButton> & { tooltip?: string }) {
  const state = useLinkToolbarButtonState();
  const { props: buttonProps } = useLinkToolbarButton(state);
  const i18n = useI18n();

  return (
    <ToolbarButton
      {...props}
      {...buttonProps}
      data-plate-focus
      tooltip={tooltip ?? i18n.toolbar.link}
    >
      <Link />
    </ToolbarButton>
  );
}
