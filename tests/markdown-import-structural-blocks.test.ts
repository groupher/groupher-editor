import { describe, expect, it } from 'vitest';

import {
  deserializeMarkdown,
  extractPlainText,
  extractToc,
  serializeHtmlUnsafe,
  serializeMarkdown,
  validateValue,
} from '../src/node';

type TTestNode = {
  children?: TTestNode[];
  text?: string;
  type?: string;
  [key: string]: unknown;
};

const flattenNodes = (nodes: TTestNode[]): TTestNode[] =>
  nodes.flatMap((node) => [
    node,
    ...(Array.isArray(node.children) ? flattenNodes(node.children) : []),
  ]);

const MINTLIFY_DOCUMENT = `<head>
  <script type="application/ld+json">ignored metadata</script>
</head>

# Guide

<Steps titleSize="h3">
  <Step title="Connect domain" id="connect-domain" stepNumber={7}>
    Choose a provider.

    <Note>
      Keep the verification record.
    </Note>
  </Step>

  <Step title="Publish" />

  <Step title="Verify">
    Confirm DNS propagation.
  </Step>
</Steps>

<AccordionGroup>
  <Accordion title="DNS records">
    | Type | Value |
    | --- | --- |
    | A | 192.0.2.1 |

    \`\`\`text wrap theme={null}
    example.com
    \`\`\`
  </Accordion>
</AccordionGroup>`;

describe('Markdown structural block import', () => {
  it('normalizes Mintlify layout containers to canonical Plate structures', () => {
    const result = deserializeMarkdown(MINTLIFY_DOCUMENT, {
      source: 'mintlify',
    });
    const nodes = flattenNodes(result.value as TTestNode[]);

    expect(result.diagnostics).toEqual([]);
    expect(result.value[1]).toEqual({
      children: [
        {
          anchorId: 'connect-domain',
          children: [
            {
              children: [{ text: 'Connect domain' }],
              type: 'step_title',
            },
            {
              children: [
                {
                  children: [{ text: 'Choose a provider.' }],
                  type: 'p',
                },
                {
                  children: [{ text: 'Keep the verification record.' }],
                  type: 'callout',
                  variant: 'note',
                },
              ],
              type: 'step_content',
            },
          ],
          stepNumber: 7,
          type: 'step',
        },
        {
          children: [
            {
              children: [{ text: 'Publish' }],
              type: 'step_title',
            },
            {
              children: [{ children: [{ text: '' }], type: 'p' }],
              type: 'step_content',
            },
          ],
          type: 'step',
        },
        {
          children: [
            {
              children: [{ text: 'Verify' }],
              type: 'step_title',
            },
            {
              children: [
                {
                  children: [{ text: 'Confirm DNS propagation.' }],
                  type: 'p',
                },
              ],
              type: 'step_content',
            },
          ],
          type: 'step',
        },
      ],
      titleSize: 'h3',
      type: 'steps',
    });
    expect(nodes.some((node) => node.type === 'table')).toBe(true);
    expect(nodes).toContainEqual({
      children: [
        {
          children: [{ text: 'example.com' }],
          type: 'code_line',
        },
      ],
      lang: 'text',
      type: 'code_block',
    });
    expect(nodes).toContainEqual({
      children: [{ text: 'DNS records' }],
      type: 'accordion_title',
    });
    expect(nodes.some((node) => node.type === 'accordion_group')).toBe(true);
    expect(
      result.value.some(
        (node) =>
          node.type === 'h3' &&
          JSON.stringify(node).includes('DNS records')
      )
    ).toBe(false);
    expect(validateValue(result.value)).toEqual({ diagnostics: [], valid: true });
    expect(extractToc(result.value)).toEqual([
      { id: 'guide', level: 1, title: 'Guide' },
    ]);
    expect(extractPlainText(result.value)).toContain('Connect domain');
  });

  it('omits undefined code block language properties', () => {
    const { value } = deserializeMarkdown('```\nuntyped code block\n```');
    const codeBlock = value[0];

    expect(codeBlock).toEqual({
      children: [
        {
          children: [{ text: 'untyped code block' }],
          type: 'code_line',
        },
      ],
      type: 'code_block',
    });
    expect(Object.hasOwn(codeBlock, 'lang')).toBe(false);
  });

  it('keeps rich blocks scoped to their Mintlify step', () => {
    const { value } = deserializeMarkdown(
      `<Steps>
  <Step title="Enter your domain">
    * Enter \`yourdomain.com\`.
    * Click **Continue**.

    <Note>Keep the \`TXT\` record.</Note>
  </Step>
</Steps>`,
      { source: 'mintlify' }
    );
    const steps = value[0] as TTestNode;
    const step = steps.children?.[0];
    const content = step?.children?.[1];
    const contentNodes = flattenNodes(content?.children ?? []);

    expect(steps.type).toBe('steps');
    expect(step?.type).toBe('step');
    expect(content?.type).toBe('step_content');
    expect(
      contentNodes.filter((node) => node.listStyleType === 'disc')
    ).toHaveLength(2);
    expect(contentNodes).toContainEqual({ code: true, text: 'yourdomain.com' });
    expect(contentNodes).toContainEqual({ code: true, text: 'TXT' });
    expect(contentNodes).toContainEqual({
      children: [
        { text: 'Keep the ' },
        { code: true, text: 'TXT' },
        { text: ' record.' },
      ],
      type: 'callout',
      variant: 'note',
    });
  });

  it('round-trips code blocks and tables through Markdown and static HTML', async () => {
    const { value } = deserializeMarkdown(MINTLIFY_DOCUMENT, {
      source: 'mintlify',
    });
    const markdown = serializeMarkdown(value);
    const html = await serializeHtmlUnsafe(value);

    expect(markdown).toContain('<accordion_group>');
    expect(markdown).toContain('<accordion_title>');
    expect(markdown).toContain('<steps titleSize="h3">');
    expect(markdown).toMatch(
      /<step[^>]*stepNumber="7"[^>]*title="Connect domain"[^>]*id="connect-domain"/
    );
    expect(markdown).toContain('| Type | Value');
    expect(markdown).toMatch(/```text\s+example\.com\s+```/);
    expect(deserializeMarkdown(markdown).value).toEqual(value);
    expect(html).toContain('<table');
    expect(html).toContain('<th');
    expect(html).toContain('class="slate-code_block');
    expect(html).toContain('<pre');
    expect(html).toContain('<details');
    expect(html).toContain('<summary');
    expect(html).toContain('<ol');
    expect(html).toContain('<li');
    expect(html).toContain('<details class="rich-editor-step-details" open="">');
    expect(html).toContain('<summary class="rich-editor-step-heading">');
    expect(html).toContain('rich-editor-steps');
    expect(html).toContain('rich-editor-steps-title-h3');
    expect(html).toContain('rich-editor-step-marker">7</span>');
    expect(html).toContain('rich-editor-step-title');
    expect(html).toContain('rich-editor-step-collapse-pill');
    expect(html).toContain('id="connect-domain"');
  });
});
