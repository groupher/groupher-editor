import { isValidElement, type ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { LinkElement } from '../src/components/ui/link-node';

type TLinkElementProps = {
  as?: string;
  children?: ReactNode;
  href?: string;
  rel?: string;
  target?: string;
};

describe('LinkElement', () => {
  it('renders the Plate inline element directly as an anchor', () => {
    const result = LinkElement({
      children: 'Workspace-level roles and permissions',
      element: {
        children: [{ text: 'Workspace-level roles and permissions' }],
        type: 'a',
        url: '/features/collaboration',
      },
    } as never);

    expect(isValidElement<TLinkElementProps>(result)).toBe(true);
    if (!isValidElement<TLinkElementProps>(result)) return;

    expect(result.props).toMatchObject({
      as: 'a',
      children: 'Workspace-level roles and permissions',
      href: '/features/collaboration',
      rel: 'noreferrer',
      target: '_blank',
    });
  });
});
