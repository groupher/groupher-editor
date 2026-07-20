import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { RichEditorStatic } from '../src/RichEditorStatic';

const STEPS_VALUE = [
  {
    type: 'steps',
    children: [
      {
        type: 'step',
        stepNumber: 1,
        children: [
          {
            type: 'step_title',
            children: [{ text: 'Buy a domain' }],
          },
          {
            type: 'step_content',
            children: [
              {
                type: 'p',
                children: [{ text: 'Choose a domain and review the order.' }],
              },
            ],
          },
        ],
      },
    ],
  },
];

describe('Steps presentation', () => {
  it('renders an expanded native disclosure for static documents', () => {
    const html = renderToStaticMarkup(<RichEditorStatic value={STEPS_VALUE} />);

    expect(html).toContain('<ol');
    expect(html).toContain('<li');
    expect(html).toContain('<details class="rich-editor-step-details" open="">');
    expect(html).toContain('<summary class="rich-editor-step-heading">');
    expect(html).toContain('rich-editor-step-marker');
    expect(html).toContain('rich-editor-step-title');
    expect(html).toContain('rich-editor-step-collapse-pill');
    expect(html).toContain('Choose a domain and review the order.');
  });
});
