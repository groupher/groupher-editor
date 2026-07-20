export const RICH_EDITOR_SCHEMA_VERSION = 1 as const;

export const RICH_EDITOR_ELEMENT_TYPES = [
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'blockquote',
  'code_block',
  'code_line',
  'hr',
  'a',
  'mention',
  'toggle',
  'accordion_group',
  'accordion',
  'accordion_title',
  'accordion_content',
  'callout',
  'table',
  'tr',
  'td',
  'th',
] as const;

export const RICH_EDITOR_INLINE_ELEMENT_TYPES = ['a', 'mention'] as const;

export const RICH_EDITOR_MARK_TYPES = [
  'bold',
  'italic',
  'underline',
  'code',
  'strikethrough',
  'subscript',
  'superscript',
  'highlight',
  'kbd',
] as const;

export const RICH_EDITOR_TRANSIENT_ELEMENT_TYPES = [
  'emoji_input',
  'mention_input',
  'slash_input',
] as const;
