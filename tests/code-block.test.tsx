import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { getCodeBlockLanguageLabel } from '../src/code-block';
import { codeBlockLowlight } from '../src/code-block-lowlight';
import { RichEditorStatic } from '../src/RichEditorStatic';
import { deserializeMarkdown, serializeHtmlUnsafe } from '../src/node';

const value = deserializeMarkdown(`\`\`\`js
export default { message: "Highlighted!" }
\`\`\``).value;

describe('code block presentation', () => {
  it('normalizes imported language aliases for display', () => {
    expect(getCodeBlockLanguageLabel('js')).toBe('JavaScript');
    expect(getCodeBlockLanguageLabel('ts')).toBe('TypeScript');
    expect(getCodeBlockLanguageLabel('md')).toBe('Markdown');
  });

  it('produces syntax tokens for the browser editor', () => {
    const highlighted = codeBlockLowlight.highlight(
      'javascript',
      'export default { message: "Highlighted!" }'
    );
    const output = JSON.stringify(highlighted);

    expect(output).toContain('hljs-keyword');
    expect(output).toContain('hljs-string');
  });

  it('keeps language labels in static and Node HTML surfaces', async () => {
    const staticHtml = renderToStaticMarkup(<RichEditorStatic value={value} />);
    const nodeHtml = await serializeHtmlUnsafe(value);

    expect(staticHtml).toContain('JavaScript');
    expect(staticHtml).toContain('hljs-keyword');
    expect(staticHtml).toContain('hljs-string');
    expect(nodeHtml).toContain('JavaScript');
    expect(nodeHtml).not.toContain('hljs-keyword');
  });
});
