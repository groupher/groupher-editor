import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { CalloutIcon } from '../src/components/ui/callout-icon';
import {
  CALLOUT_VARIANTS,
  getCalloutPresentation,
  getCalloutTitle,
} from '../src/components/ui/callout-presentation';

const EXPECTED_PRESENTATIONS = [
  ['note', 'Note', 'bg-blue-50/80'],
  ['info', 'Info', 'bg-neutral-50'],
  ['tip', 'Tip', 'bg-green-50/80'],
  ['success', 'Success', 'bg-green-50/80'],
  ['important', 'Important', 'bg-violet-50/80'],
  ['warning', 'Warning', 'bg-amber-50/80'],
  ['danger', 'Danger', 'bg-red-50/80'],
  ['custom', 'Callout', 'bg-brand/5'],
] as const;

describe('Callout presentation', () => {
  it('defines a presentation for every canonical variant', () => {
    expect(CALLOUT_VARIANTS).toEqual(
      EXPECTED_PRESENTATIONS.map(([variant]) => variant)
    );

    EXPECTED_PRESENTATIONS.forEach(([variant, title, backgroundClass]) => {
      const presentation = getCalloutPresentation(variant);

      expect(presentation).toMatchObject({ title, variant });
      expect(presentation.surfaceClassName).toContain(backgroundClass);
      expect(presentation.surfaceClassName).toContain('border-');
    });
  });

  it('falls back to the custom presentation for unknown variants', () => {
    expect(getCalloutPresentation('vendor-only')).toMatchObject({
      title: 'Callout',
      variant: 'custom',
    });
  });

  it('prefers an explicit non-empty title', () => {
    expect(getCalloutTitle('  Release context  ', 'Note')).toBe(
      'Release context'
    );
    expect(getCalloutTitle('  ', 'Note')).toBe('Note');
  });

  it('renders the variant default Lucide icon', () => {
    const html = renderToStaticMarkup(
      <CalloutIcon presentation={getCalloutPresentation('tip')} />
    );

    expect(html).toContain('lucide-lightbulb');
  });

  it('renders a supported explicit Lucide icon before the variant default', () => {
    const html = renderToStaticMarkup(
      <CalloutIcon
        icon="key"
        iconLibrary="lucide"
        presentation={getCalloutPresentation('custom')}
      />
    );

    expect(html).toContain('lucide-key');
    expect(html).not.toContain('lucide-message-square');
  });

  it('falls back to the variant icon for an unknown Lucide name', () => {
    const html = renderToStaticMarkup(
      <CalloutIcon
        icon="vendor-only"
        iconLibrary="lucide"
        presentation={getCalloutPresentation('warning')}
      />
    );

    expect(html).toContain('lucide-triangle-alert');
    expect(html).not.toContain('vendor-only');
  });

  it('preserves explicit emoji icons', () => {
    const html = renderToStaticMarkup(
      <CalloutIcon
        icon="⭐"
        presentation={getCalloutPresentation('info')}
      />
    );

    expect(html).toContain('⭐');
    expect(html).not.toContain('<svg');
  });
});
