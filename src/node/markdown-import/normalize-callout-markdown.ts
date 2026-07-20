import type { TRichEditorMarkdownSource } from '@/node/types';
import type {
  TMarkdownNormalizationResult,
  TPendingMarkdownImportDiagnostic,
} from '@/node/markdown-import/types';

type TCalloutAttributes = Record<string, string>;
type TMdxCalloutSource = 'fumadocs' | 'mintlify' | 'nextra';

type TMintlifyTitledContainer = {
  component: 'Card' | 'Step' | 'Tab';
  headingLevel: 3 | 4;
};

type TPortableCallout = {
  body: string;
  id: string;
  variant: string;
  icon?: string;
  iconLibrary?: 'lucide';
  title?: string;
};

type TNormalizationContext = {
  diagnostics: TPendingMarkdownImportDiagnostic[];
  nextCalloutId: () => string;
  source: TRichEditorMarkdownSource;
};

const MDX_CALLOUT_COMPONENTS: Record<
  TMdxCalloutSource,
  ReadonlySet<string>
> = {
  fumadocs: new Set(['Callout']),
  mintlify: new Set([
    'Callout',
    'Check',
    'Danger',
    'Info',
    'Note',
    'Tip',
    'Warning',
  ]),
  nextra: new Set(['Callout']),
} as const;

const SOURCE_LABELS: Record<TRichEditorMarkdownSource, string> = {
  docusaurus: 'Docusaurus',
  fumadocs: 'Fumadocs',
  gitbook: 'GitBook',
  github: 'GitHub',
  groupher: 'Groupher',
  mintlify: 'Mintlify',
  'mkdocs-material': 'MkDocs Material',
  nextra: 'Nextra',
  rspress: 'Rspress',
  starlight: 'Starlight',
  vitepress: 'VitePress',
};

const LUCIDE_ICON_ALIASES: Partial<
  Record<TRichEditorMarkdownSource, Record<string, string>>
> = {
  gitbook: {
    books: 'library-big',
  },
  mintlify: {
    key: 'key',
  },
};

const MINTLIFY_TITLED_CONTAINERS: TMintlifyTitledContainer[] = [
  { component: 'Step', headingLevel: 3 },
  { component: 'Tab', headingLevel: 4 },
  { component: 'Card', headingLevel: 4 },
];

const MINTLIFY_GROUP_CONTAINERS = [
  'Steps',
  'Tabs',
  'CardGroup',
] as const;

const escapeAttribute = (value: string): string =>
  value.replaceAll('&', '&amp;').replaceAll('"', '&quot;');

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

const parseAttributes = (source: string): TCalloutAttributes => {
  const attributes: TCalloutAttributes = {};
  const pattern = /([A-Za-z][\w:-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;

  for (const match of source.matchAll(pattern)) {
    attributes[match[1]] = match[2] ?? match[3] ?? '';
  }

  return attributes;
};

const titledContainerMarkdown = (
  attributeSource: string,
  body: string,
  headingLevel: TMintlifyTitledContainer['headingLevel']
): string => {
  const title = parseAttributes(attributeSource).title?.trim();
  const content = dedentBody(body);

  if (!title) return content;

  return `${'#'.repeat(headingLevel)} ${title}${content ? `\n\n${content}` : ''}`;
};

const normalizeMintlifyTitledContainer = (
  markdown: string,
  { component, headingLevel }: TMintlifyTitledContainer
): string => {
  const paired = new RegExp(
    `^[\\t ]*<${component}\\b([^>]*)>[\\t ]*\\n?([\\s\\S]*?)^[\\t ]*</${component}>[\\t ]*$`,
    'gm'
  );
  const selfClosing = new RegExp(
    `^[\\t ]*<${component}\\b([^>]*)\\/>[\\t ]*$`,
    'gm'
  );

  return markdown
    .replace(selfClosing, (_original, attributeSource: string) =>
      titledContainerMarkdown(attributeSource, '', headingLevel)
    )
    .replace(
      paired,
      (_original, attributeSource: string, body: string) =>
        titledContainerMarkdown(attributeSource, body, headingLevel)
    );
};

const normalizeMintlifyLayout = (markdown: string): string => {
  let normalized = markdown.replace(/<head\b[^>]*>[\s\S]*?<\/head>\s*/gi, '');

  MINTLIFY_TITLED_CONTAINERS.forEach((container) => {
    normalized = normalizeMintlifyTitledContainer(normalized, container);
  });

  MINTLIFY_GROUP_CONTAINERS.forEach((component) => {
    normalized = normalized.replace(
      new RegExp(`^[\\t ]*</?${component}\\b[^>]*>[\\t ]*$`, 'gm'),
      ''
    );
  });

  return normalized.replace(
    /<Tooltip\b[^>]*>([\s\S]*?)<\/Tooltip>/g,
    (_original, body: string) => body
  );
};

const portableCallout = ({
  body,
  icon,
  iconLibrary,
  id,
  title,
  variant,
}: TPortableCallout): string => {
  const attributes = [
    `compatId="${escapeAttribute(id)}"`,
    `variant="${escapeAttribute(variant)}"`,
  ];

  if (title) attributes.push(`title="${escapeAttribute(title)}"`);
  if (icon) attributes.push(`icon="${escapeAttribute(icon)}"`);
  if (iconLibrary) {
    attributes.push(`iconLibrary="${escapeAttribute(iconLibrary)}"`);
  }

  return `<callout ${attributes.join(' ')}>
${dedentBody(body)}
</callout>`;
};

const addUnsupportedAttribute = (
  context: TNormalizationContext,
  calloutId: string,
  attribute: string,
  message?: string
) => {
  context.diagnostics.push({
    attribute,
    calloutId,
    code: 'unsupported_attribute',
    message:
      message ??
      `${SOURCE_LABELS[context.source]} Callout ${attribute} is not persisted.`,
    severity: 'warning',
  });
};

const lucideIcon = (
  context: TNormalizationContext,
  calloutId: string,
  vendorIcon: string | undefined
): Pick<TPortableCallout, 'icon' | 'iconLibrary'> => {
  if (!vendorIcon) return {};

  const icon = LUCIDE_ICON_ALIASES[context.source]?.[vendorIcon];
  if (icon) return { icon, iconLibrary: 'lucide' };

  addUnsupportedAttribute(
    context,
    calloutId,
    'icon',
    `${SOURCE_LABELS[context.source]} icon ${vendorIcon} has no Lucide mapping and is not persisted.`
  );
  return {};
};

const mdxVariant = (
  source: TMdxCalloutSource,
  component: string,
  attributes: TCalloutAttributes
): string => {
  if (source === 'mintlify') {
    return (
      {
        Callout: 'custom',
        Check: 'success',
        Danger: 'danger',
        Info: 'info',
        Note: 'note',
        Tip: 'tip',
        Warning: 'warning',
      }[component] ?? 'custom'
    );
  }

  const variant = attributes.type;
  if (source === 'nextra') {
    return (
      {
        error: 'danger',
        important: 'important',
        info: 'info',
        warning: 'warning',
      }[variant] ?? 'tip'
    );
  }

  return (
    {
      error: 'danger',
      idea: 'tip',
      success: 'success',
      warn: 'warning',
      warning: 'warning',
    }[variant] ?? 'info'
  );
};

const normalizeMdxCallouts = (
  markdown: string,
  context: TNormalizationContext & {
    source: TMdxCalloutSource;
  }
): string => {
  const components = MDX_CALLOUT_COMPONENTS[context.source];
  const withoutKnownImport = markdown.replace(
    /^import\s+\{[^}]*\bCallout\b[^}]*\}\s+from\s+['"][^'"]+['"];?\s*$/gm,
    ''
  );

  let normalized = withoutKnownImport;

  components.forEach((component) => {
    normalized = normalized.replace(
      new RegExp(
        `<${component}\\b([^>]*)>([\\s\\S]*?)<\\/${component}>`,
        'g'
      ),
      (_original, attributeSource: string, body: string) => {
        const id = context.nextCalloutId();
        const attributes = parseAttributes(attributeSource);
        const variant = mdxVariant(context.source, component, attributes);
        let icon: Pick<TPortableCallout, 'icon' | 'iconLibrary'> = {};

        if (context.source === 'nextra' && attributes.emoji) {
          icon = { icon: attributes.emoji };
        } else if (attributes.icon) {
          icon = lucideIcon(context, id, attributes.icon);
        }

        if (context.source === 'mintlify') {
          ['color', 'iconType'].forEach((attribute) => {
            if (attributes[attribute] !== undefined) {
              addUnsupportedAttribute(
                context,
                id,
                attribute,
                `Mintlify Callout ${attribute} is presentation-only and is not persisted.`
              );
            }
          });
        }

        return portableCallout({
          body,
          id,
          title: attributes.title,
          variant,
          ...icon,
        });
      }
    );
  });

  return normalized;
};

const colonVariant = (
  source: 'docusaurus' | 'rspress' | 'starlight' | 'vitepress',
  qualifier: string
): string | undefined => {
  if (source === 'starlight') {
    return {
      caution: 'warning',
      danger: 'danger',
      note: 'note',
      tip: 'tip',
    }[qualifier];
  }

  return {
    danger: 'danger',
    important: 'important',
    info: 'info',
    note: 'note',
    tip: 'tip',
    warning: 'warning',
  }[qualifier];
};

const colonTitle = (source: string, suffix: string): string | undefined => {
  const value = suffix.trim();
  if (!value) return;

  if (source === 'docusaurus' || source === 'starlight') {
    return value.match(/^\[([\s\S]*)\]$/)?.[1];
  }

  if (source === 'rspress') {
    return value.match(/^\{title=(?:"([^"]*)"|'([^']*)')\}$/)?.slice(1).find(Boolean) ?? value;
  }

  return value;
};

const normalizeColonContainers = (
  markdown: string,
  context: TNormalizationContext & {
    source: 'docusaurus' | 'rspress' | 'starlight' | 'vitepress';
  }
): string => {
  const lines = markdown.split('\n');
  const output: string[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const opening = lines[index].match(/^(\s*):::\s*([a-z][\w-]*)(.*)$/);
    if (!opening) {
      output.push(lines[index]);
      continue;
    }

    const [, indent, qualifier, suffix] = opening;
    const variant = colonVariant(context.source, qualifier);
    if (!variant) {
      output.push(lines[index]);
      continue;
    }

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
      portableCallout({
        body: lines.slice(index + 1, closing).join('\n'),
        id: context.nextCalloutId(),
        title: colonTitle(context.source, suffix),
        variant,
      })
    );
    index = closing;
  }

  return output.join('\n');
};

const normalizeGithubAlerts = (
  markdown: string,
  context: TNormalizationContext
): string => {
  const lines = markdown.split('\n');
  const output: string[] = [];
  const variants: Record<string, string> = {
    CAUTION: 'danger',
    DANGER: 'danger',
    IMPORTANT: 'important',
    INFO: 'info',
    NOTE: 'note',
    TIP: 'tip',
    WARNING: 'warning',
  };

  for (let index = 0; index < lines.length; index += 1) {
    const opening = lines[index].match(/^\s*>\s*\[!([A-Z]+)\]\s*$/);
    const variant = opening ? variants[opening[1]] : undefined;
    if (!variant) {
      output.push(lines[index]);
      continue;
    }

    const body: string[] = [];
    let cursor = index + 1;
    while (cursor < lines.length) {
      const quoteLine = lines[cursor].match(/^\s*>\s?(.*)$/);
      if (!quoteLine) break;
      body.push(quoteLine[1]);
      cursor += 1;
    }

    output.push(
      portableCallout({
        body: body.join('\n'),
        id: context.nextCalloutId(),
        variant,
      })
    );
    index = cursor - 1;
  }

  return output.join('\n');
};

const normalizeMkdocsAdmonitions = (
  markdown: string,
  context: TNormalizationContext
): string => {
  const lines = markdown.split('\n');
  const output: string[] = [];
  const variants: Record<string, string> = {
    abstract: 'info',
    bug: 'danger',
    danger: 'danger',
    example: 'note',
    failure: 'danger',
    info: 'info',
    note: 'note',
    question: 'note',
    quote: 'note',
    success: 'success',
    tip: 'tip',
    warning: 'warning',
  };

  for (let index = 0; index < lines.length; index += 1) {
    const opening = lines[index].match(
      /^(\s*)!!!\s+([a-z][\w-]*)(?:\s+"([^"]*)")?\s*$/
    );
    const variant = opening ? variants[opening[2]] : undefined;
    if (!opening || !variant) {
      output.push(lines[index]);
      continue;
    }

    const body: string[] = [];
    const contentIndent = `${opening[1]}    `;
    let cursor = index + 1;
    while (cursor < lines.length) {
      const line = lines[cursor];
      if (line.trim() === '') {
        body.push('');
        cursor += 1;
        continue;
      }
      if (!line.startsWith(contentIndent)) break;
      body.push(line.slice(contentIndent.length));
      cursor += 1;
    }

    output.push(
      portableCallout({
        body: body.join('\n'),
        id: context.nextCalloutId(),
        title: opening[3] || undefined,
        variant,
      })
    );
    index = cursor - 1;
  }

  return output.join('\n');
};

const normalizeGitbookHints = (
  markdown: string,
  context: TNormalizationContext
): string => {
  const lines = markdown.split('\n');
  const output: string[] = [];
  const variants: Record<string, string> = {
    danger: 'danger',
    info: 'info',
    success: 'success',
    warning: 'warning',
  };

  for (let index = 0; index < lines.length; index += 1) {
    const opening = lines[index].match(/^\s*\{%\s*hint\s+([^%]+)%\}\s*$/);
    if (!opening) {
      output.push(lines[index]);
      continue;
    }

    const attributes = parseAttributes(opening[1]);
    const variant = variants[attributes.style];
    if (!variant) {
      output.push(lines[index]);
      continue;
    }

    let closing = index + 1;
    while (
      closing < lines.length &&
      !/^\s*\{%\s*endhint\s*%\}\s*$/.test(lines[closing])
    ) {
      closing += 1;
    }
    if (closing === lines.length) {
      output.push(lines[index]);
      continue;
    }

    const id = context.nextCalloutId();
    const bodyLines = trimBlankLines(lines.slice(index + 1, closing));
    const heading = bodyLines[0]?.match(/^#{1,6}\s+(.+)$/);
    const title = heading?.[1];
    const body = title ? trimBlankLines(bodyLines.slice(1)) : bodyLines;

    output.push(
      portableCallout({
        body: body.join('\n'),
        id,
        title,
        variant,
        ...lucideIcon(context, id, attributes.icon),
      })
    );
    index = closing;
  }

  return output.join('\n');
};

export const normalizeCalloutMarkdown = (
  markdown: string,
  source: TRichEditorMarkdownSource
): TMarkdownNormalizationResult => {
  const diagnostics: TPendingMarkdownImportDiagnostic[] = [];
  let calloutIndex = 0;
  const context: TNormalizationContext = {
    diagnostics,
    nextCalloutId: () => `callout-${calloutIndex++}`,
    source,
  };
  let normalized = markdown;

  if (source === 'mintlify') {
    normalized = normalizeMintlifyLayout(normalized);
  }

  if (source === 'fumadocs' || source === 'mintlify' || source === 'nextra') {
    normalized = normalizeMdxCallouts(normalized, { ...context, source });
  } else if (
    source === 'docusaurus' ||
    source === 'rspress' ||
    source === 'starlight' ||
    source === 'vitepress'
  ) {
    normalized = normalizeColonContainers(normalized, { ...context, source });
  } else if (source === 'github') {
    normalized = normalizeGithubAlerts(normalized, context);
  } else if (source === 'mkdocs-material') {
    normalized = normalizeMkdocsAdmonitions(normalized, context);
  } else if (source === 'gitbook') {
    normalized = normalizeGitbookHints(normalized, context);
  }

  if (source === 'nextra' || source === 'rspress') {
    normalized = normalizeGithubAlerts(normalized, context);
  }

  return { diagnostics, markdown: normalized };
};
