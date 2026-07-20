import { describe, expect, it } from 'vitest';

import {
  deserializeMarkdown,
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

<Steps>
  <Step title="Connect domain">
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
    expect(result.value).toEqual(
      expect.arrayContaining([
        {
          children: [{ text: 'Connect domain' }],
          type: 'h3',
        },
        {
          children: [{ text: 'Keep the verification record.' }],
          type: 'callout',
          variant: 'note',
        },
        {
          children: [{ text: 'Publish' }],
          type: 'h3',
        },
        {
          children: [{ text: 'Verify' }],
          type: 'h3',
        },
      ])
    );
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

  it('round-trips code blocks and tables through Markdown and static HTML', async () => {
    const { value } = deserializeMarkdown(MINTLIFY_DOCUMENT, {
      source: 'mintlify',
    });
    const markdown = serializeMarkdown(value);
    const html = await serializeHtmlUnsafe(value);

    expect(markdown).toContain('<accordion_group>');
    expect(markdown).toContain('<accordion_title>');
    expect(markdown).toContain('| Type | Value');
    expect(markdown).toMatch(/```text\s+example\.com\s+```/);
    expect(html).toContain('<table');
    expect(html).toContain('<th');
    expect(html).toContain('class="slate-code_block');
    expect(html).toContain('<pre');
    expect(html).toContain('<details');
    expect(html).toContain('<summary');
  });
});
