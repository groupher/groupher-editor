import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { RichEditorStatic } from '../src/RichEditorStatic';
import {
  deserializeMarkdown,
  serializeHtmlUnsafe,
  serializeMarkdown,
  validateValue,
} from '../src/node';

const canonicalMarkdown = `<tabs defaultValue="typescript" syncTabKey="sdk-language" persist="local">
  <tab value="javascript" label="JavaScript" icon={{"type":"lucide","name":"braces"}}>
    ## JavaScript

    Use **JavaScript**.
  </tab>
  <tab value="typescript" label="TypeScript" id="typescript-sdk">
    ## TypeScript

    - Typed
    - Portable
  </tab>
</tabs>`;

describe('Tabs', () => {
  it('round-trips canonical MDX with arbitrary rich content and stable values', () => {
    const result = deserializeMarkdown(canonicalMarkdown);
    const tabs = result.value[0];

    expect(result.diagnostics).toEqual([]);
    expect(validateValue(result.value)).toEqual({ diagnostics: [], valid: true });
    expect(tabs).toMatchObject({
      children: [
        {
          children: [
            { type: 'h2' },
            {
              children: [
                { text: 'Use ' },
                { bold: true, text: 'JavaScript' },
                { text: '.' },
              ],
              type: 'p',
            },
          ],
          icon: { name: 'braces', type: 'lucide' },
          label: 'JavaScript',
          type: 'tab',
          value: 'javascript',
        },
        {
          anchorId: 'typescript-sdk',
          children: [
            { type: 'h2' },
            { listStyleType: 'disc', type: 'p' },
            { listStyleType: 'disc', type: 'p' },
          ],
          label: 'TypeScript',
          type: 'tab',
          value: 'typescript',
        },
      ],
      defaultValue: 'typescript',
      persist: 'local',
      syncTabKey: 'sdk-language',
      type: 'tabs',
    });

    const markdown = serializeMarkdown(result.value);
    expect(markdown).toContain('<tabs');
    expect(markdown).toContain('<tab');
    expect(markdown).toContain('syncTabKey="sdk-language"');
    expect(markdown).toContain('icon={{"name":"braces","type":"lucide"}}');
    expect(deserializeMarkdown(markdown)).toEqual(result);
  });

  it.each([
    {
      labels: ['pnpm', 'npm'],
      markdown: `<Tabs items={['pnpm', 'npm']} defaultIndex={1} groupId="package-manager" persist>
  <Tab value="pnpm">pnpm install</Tab>
  <Tab value="npm">npm install</Tab>
</Tabs>`,
      properties: {
        defaultValue: 'npm',
        persist: 'local',
        syncTabKey: 'package-manager',
      },
      source: 'fumadocs' as const,
    },
    {
      labels: ['Apple', 'Android'],
      markdown: `<Tabs groupId="mobile-os">
  <TabItem value="apple" label="Apple">iOS</TabItem>
  <TabItem value="android" label="Android" default>Android</TabItem>
</Tabs>`,
      properties: {
        defaultValue: 'android',
        persist: 'local',
        syncTabKey: 'mobile-os',
      },
      source: 'docusaurus' as const,
    },
    {
      labels: ['npm', 'pnpm'],
      markdown: `<Tabs items={['npm', 'pnpm']} defaultIndex={1} storageKey="package-manager">
  <Tabs.Tab>npm install</Tabs.Tab>
  <Tabs.Tab>pnpm install</Tabs.Tab>
</Tabs>`,
      properties: {
        defaultValue: 'pnpm',
        persist: 'local',
        syncTabKey: 'package-manager',
      },
      source: 'nextra' as const,
    },
    {
      labels: ['JavaScript', 'Python'],
      markdown: `<Tabs defaultTabIndex={1}>
  <Tab title="JavaScript" icon="js">const value = 1</Tab>
  <Tab title="Python" icon="python" iconType="brands">value = 1</Tab>
</Tabs>`,
      properties: {
        defaultValue: 'python',
        persist: 'local',
        syncTabKey: 'mintlify:tabs',
      },
      source: 'mintlify' as const,
    },
    {
      labels: ['npm', 'pnpm'],
      markdown: `<Tabs syncKey="package-manager">
  <TabItem label="npm" icon="seti:npm">npm install</TabItem>
  <TabItem label="pnpm">pnpm install</TabItem>
</Tabs>`,
      properties: {
        defaultValue: 'npm',
        persist: 'local',
        syncTabKey: 'package-manager',
      },
      source: 'starlight' as const,
    },
  ])(
    'normalizes $source Tabs into the canonical AST',
    ({ labels, markdown, properties, source }) => {
      const result = deserializeMarkdown(markdown, { source });
      const tabs = result.value[0];

      expect(result.diagnostics).toEqual([]);
      expect(tabs).toMatchObject({
        ...properties,
        type: 'tabs',
      });
      expect(
        (tabs.children as Array<{ label: string }>).map(({ label }) => label)
      ).toEqual(labels);
      expect(tabs.children).not.toEqual(
        expect.arrayContaining([expect.objectContaining({ index: expect.anything() })])
      );
      expect(validateValue(result.value)).toEqual({
        diagnostics: [],
        valid: true,
      });
    }
  );

  it('warns on dynamic MDX properties without evaluating them', () => {
    const result = deserializeMarkdown(
      `<Tabs items={getTabs()}>
  <Tab value="safe">Safe content</Tab>
</Tabs>`,
      { source: 'fumadocs' }
    );

    expect(result.value[0]).toMatchObject({
      children: [{ label: 'safe', value: 'safe' }],
      type: 'tabs',
    });
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        attribute: 'items',
        code: 'unsupported_attribute',
        severity: 'warning',
      }),
    ]);
  });

  it('promotes compact inline vendor markup to a root Tabs block', () => {
    const result = deserializeMarkdown(
      '<Tabs><Tab title="JavaScript">JS SDK</Tab><Tab title="Python">Python SDK</Tab></Tabs>',
      { source: 'mintlify' }
    );

    expect(result.value).toEqual([
      expect.objectContaining({
        children: [
          expect.objectContaining({ label: 'JavaScript', value: 'javascript' }),
          expect.objectContaining({ label: 'Python', value: 'python' }),
        ],
        type: 'tabs',
      }),
    ]);
  });

  it('renders APG tab semantics in React and expands every panel in Node HTML', async () => {
    const value = deserializeMarkdown(canonicalMarkdown).value;
    const staticHtml = renderToStaticMarkup(<RichEditorStatic value={value} />);
    const nodeHtml = await serializeHtmlUnsafe(value);

    expect(staticHtml).toContain('role="tablist"');
    expect(staticHtml.match(/role="tab"/g)).toHaveLength(2);
    expect(staticHtml.match(/role="tabpanel"/g)).toHaveLength(2);
    expect(staticHtml).toContain('aria-selected="true"');
    expect(staticHtml).toContain('aria-selected="false"');

    expect(nodeHtml).toContain('rich-editor-tabs-fallback');
    expect(nodeHtml).not.toContain('role="tablist"');
    expect(nodeHtml).toContain('JavaScript');
    expect(nodeHtml).toContain('<strong class="slate-bold">');
    expect(nodeHtml).toContain('TypeScript');
    expect(nodeHtml).toContain('Typed');
    expect(nodeHtml.indexOf('JavaScript')).toBeLessThan(
      nodeHtml.indexOf('TypeScript')
    );
  });

  it('rejects duplicate values and persistence without a synchronization key', () => {
    const result = validateValue([
      {
        children: [
          {
            children: [{ children: [{ text: '' }], type: 'p' }],
            label: 'First',
            type: 'tab',
            value: 'same',
          },
          {
            children: [{ children: [{ text: '' }], type: 'p' }],
            label: 'Second',
            type: 'tab',
            value: ' same ',
          },
        ],
        persist: 'local',
        type: 'tabs',
      },
    ]);

    expect(result.valid).toBe(false);
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'invalid_property', path: [0] }),
        expect.objectContaining({ code: 'invalid_property', path: [0, 1] }),
      ])
    );
  });
});
