import type { TRichEditorMarkdownSource } from '@/node/types';

type TFencedBlock = {
  closing: number;
  info: string;
  label?: string;
  lines: string[];
};

const FENCE_OPEN = /^(\s*)(`{3,}|~{3,})(.*)$/;
const CODE_GROUP_OPEN = /^(\s*):::\s*code-group(?:\s+.*)?$/;

const closingFencePattern = (marker: string): RegExp =>
  new RegExp(`^\\s*${marker[0]}{${marker.length},}\\s*$`);

const escapeAttribute = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const codeLanguage = (info: string): string =>
  info.replace(/\{[^}]+\}$/, '').trim();

const readFencedBlock = (
  lines: string[],
  start: number,
  end: number
): TFencedBlock | undefined => {
  const opening = lines[start].match(FENCE_OPEN);
  if (!opening) return;

  const [, indent, marker, rawInfo] = opening;
  const closingPattern = closingFencePattern(marker);
  let closing = start + 1;
  while (closing < end && !closingPattern.test(lines[closing])) closing += 1;
  if (closing === end) return;

  const trimmedInfo = rawInfo.trim();
  const labelMatch = trimmedInfo.match(/(?:^|\s)\[([^\]]+)\]\s*$/);
  const info = labelMatch
    ? trimmedInfo.slice(0, labelMatch.index).trim()
    : trimmedInfo;
  const normalizedOpening = `${indent}${marker}${info}`;

  return {
    closing,
    info,
    label: labelMatch?.[1]?.trim() || undefined,
    lines: [normalizedOpening, ...lines.slice(start + 1, closing + 1)],
  };
};

const findContainerClosing = (
  lines: string[],
  start: number,
  indent: string
): number | undefined => {
  for (let index = start + 1; index < lines.length; index += 1) {
    const fence = readFencedBlock(lines, index, lines.length);
    if (fence) {
      index = fence.closing;
      continue;
    }

    if (new RegExp(`^${indent}:::\\s*$`).test(lines[index])) return index;
  }
};

const normalizeGroup = (
  lines: string[],
  opening: number,
  closing: number,
  groupId: string
): string | undefined => {
  const items: string[] = [];

  for (let index = opening + 1; index < closing; index += 1) {
    if (!lines[index].trim()) continue;

    const fence = readFencedBlock(lines, index, closing);
    if (!fence) return;

    const language = codeLanguage(fence.info);
    const label = fence.label || language.toUpperCase() || `Code ${items.length + 1}`;
    items.push(`<code_group_item codeGroupIndex={${items.length}} label="${escapeAttribute(label)}">
${fence.lines.join('\n')}
</code_group_item>`);
    index = fence.closing;
  }

  if (items.length === 0) return;

  return `<code_group groupId="${groupId}">
${items.join('\n')}
</code_group>`;
};

export const normalizeCodeGroupMarkdown = (
  markdown: string,
  source: TRichEditorMarkdownSource
): string => {
  if (source !== 'vitepress') return markdown;

  const lines = markdown.split('\n');
  const output: string[] = [];
  let groupIndex = 0;

  for (let index = 0; index < lines.length; index += 1) {
    const fence = readFencedBlock(lines, index, lines.length);
    if (fence) {
      output.push(...lines.slice(index, fence.closing + 1));
      index = fence.closing;
      continue;
    }

    const opening = lines[index].match(CODE_GROUP_OPEN);
    if (!opening) {
      output.push(lines[index]);
      continue;
    }

    const closing = findContainerClosing(lines, index, opening[1]);
    if (closing === undefined) {
      output.push(lines[index]);
      continue;
    }

    const normalized = normalizeGroup(
      lines,
      index,
      closing,
      `vitepress-code-group-${groupIndex}`
    );
    if (!normalized) {
      output.push(...lines.slice(index, closing + 1));
      index = closing;
      continue;
    }

    output.push(normalized);
    groupIndex += 1;
    index = closing;
  }

  return output.join('\n');
};
