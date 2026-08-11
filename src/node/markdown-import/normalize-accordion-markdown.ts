import type { TRichEditorMarkdownSource } from '@/node/types';

type TAccordionAttributes = Record<string, string>;

const trimBlankLines = (lines: string[]): string[] => {
  let start = 0;
  let end = lines.length;

  while (start < end && lines[start].trim() === '') start += 1;
  while (end > start && lines[end - 1].trim() === '') end -= 1;

  return lines.slice(start, end);
};

const dedentBody = (body: string): string => {
  const lines = trimBlankLines(body.split('\n'));
  const indents = lines
    .filter((line) => line.trim().length > 0)
    .map((line) => line.match(/^\s*/)?.[0].length ?? 0);
  const indent = indents.length > 0 ? Math.min(...indents) : 0;

  return lines.map((line) => line.slice(indent)).join('\n');
};

const parseAttributes = (source: string): TAccordionAttributes => {
  const attributes: TAccordionAttributes = {};
  const pattern = /([A-Za-z][\w:-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;

  for (const match of source.matchAll(pattern)) {
    attributes[match[1]] = match[2] ?? match[3] ?? '';
  }

  return attributes;
};

const portableAccordion = (title: string, body: string): string => {
  const content = dedentBody(body);

  return `<accordion>
<accordion_title>
${title.trim()}
</accordion_title>
<accordion_content>
${content}
</accordion_content>
</accordion>`;
};

const portableAccordionGroup = (items: string[]): string => `<accordion_group>
${items.join('\n')}
</accordion_group>`;

const normalizeNamedAccordionItems = (markdown: string): string => {
  const selfClosing = /<Accordion\b([^>]*)\/>/g;
  const paired = /<Accordion\b([^>]*)>([\s\S]*?)<\/Accordion>/g;

  return markdown
    .replace(selfClosing, (_original, attributeSource: string) => {
      const title = parseAttributes(attributeSource).title ?? '';

      return portableAccordion(title, '');
    })
    .replace(
      paired,
      (_original, attributeSource: string, body: string) => {
        const title = parseAttributes(attributeSource).title ?? '';

        return portableAccordion(title, body);
      }
    );
};

const normalizeNamedAccordionGroups = (markdown: string): string =>
  markdown.replace(
    /<(AccordionGroup|Accordions)\b[^>]*>([\s\S]*?)<\/\1>/g,
    (original, _component: string, body: string) => {
      const normalized = normalizeNamedAccordionItems(body);

      if (normalized === body) return original;

      return `<accordion_group>
${dedentBody(normalized)}
</accordion_group>`;
    }
  );

const normalizeStandaloneNamedAccordions = (markdown: string): string => {
  const selfClosing = /<Accordion\b([^>]*)\/>/g;
  const paired = /<Accordion\b([^>]*)>([\s\S]*?)<\/Accordion>/g;

  return markdown
    .replace(selfClosing, (_original, attributeSource: string) => {
      const title = parseAttributes(attributeSource).title ?? '';

      return portableAccordionGroup([portableAccordion(title, '')]);
    })
    .replace(
      paired,
      (_original, attributeSource: string, body: string) => {
        const title = parseAttributes(attributeSource).title ?? '';

        return portableAccordionGroup([portableAccordion(title, body)]);
      }
    );
};

const htmlDetailsItem = (body: string): string | undefined => {
  const summary = body.match(/<summary\b[^>]*>([\s\S]*?)<\/summary>/i);
  if (!summary || summary.index === undefined) return;

  const content = `${body.slice(0, summary.index)}${body.slice(
    summary.index + summary[0].length
  )}`;

  return portableAccordion(dedentBody(summary[1]), content);
};

const normalizeHtmlDetails = (markdown: string): string => {
  const pattern =
    /<details\b[^>]*>([\s\S]*?)<\/details>/gi;
  let cursor = 0;
  let output = '';
  let pendingItems: string[] = [];

  const flushPendingItems = () => {
    if (pendingItems.length === 0) return;

    output += portableAccordionGroup(pendingItems);
    pendingItems = [];
  };

  for (const match of markdown.matchAll(pattern)) {
    const index = match.index ?? 0;
    const gap = markdown.slice(cursor, index);
    const item = htmlDetailsItem(match[1]);

    if (!item) {
      flushPendingItems();
      output += `${gap}${match[0]}`;
      cursor = index + match[0].length;
      continue;
    }

    if (pendingItems.length > 0 && gap.trim().length > 0) {
      flushPendingItems();
      output += gap;
    } else if (pendingItems.length === 0) {
      output += gap;
    }

    pendingItems.push(item);
    cursor = index + match[0].length;
  }

  flushPendingItems();
  output += markdown.slice(cursor);

  return output;
};

const normalizeVitePressDetails = (markdown: string): string => {
  const lines = markdown.split('\n');
  const output: string[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const opening = lines[index].match(/^(\s*):::\s*details(?:\s+(.*?))?\s*$/);
    if (!opening) {
      output.push(lines[index]);
      continue;
    }

    const [, indent, rawTitle] = opening;
    let closing = index + 1;
    while (
      closing < lines.length &&
      !new RegExp(`^${indent}:::\\s*$`).test(lines[closing])
    ) {
      closing += 1;
    }

    if (closing === lines.length) {
      output.push(lines[index]);
      continue;
    }

    output.push(
      portableAccordionGroup([
        portableAccordion(
          rawTitle?.trim() || 'Details',
          lines.slice(index + 1, closing).join('\n')
        ),
      ])
    );
    index = closing;
  }

  return output.join('\n');
};

export const normalizeAccordionMarkdown = (
  markdown: string,
  source: TRichEditorMarkdownSource = 'groupher'
): string => {
  const withVitePressDetails =
    source === 'vitepress' ? normalizeVitePressDetails(markdown) : markdown;
  const withNamedGroups = normalizeNamedAccordionGroups(withVitePressDetails);
  const withStandaloneItems = normalizeStandaloneNamedAccordions(withNamedGroups);

  return normalizeHtmlDetails(withStandaloneItems);
};
