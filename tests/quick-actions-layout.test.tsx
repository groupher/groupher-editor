import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import RichEditor from '../src/RichEditor';

describe('Quick Actions layout', () => {
  it('keeps the action rail without reserving space across the editor', () => {
    const html = renderToStaticMarkup(
      <RichEditor
        defaultValue={[{ type: 'p', children: [{ text: '' }] }]}
      />
    );

    expect(html).toContain('rich-editor-quick-actions');
    expect(html).not.toContain('rich-editor-with-quick-actions');
    expect(html).not.toContain('--rich-editor-quick-action-space');
  });
});
