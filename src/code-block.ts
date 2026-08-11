const CODE_BLOCK_LANGUAGE_ALIASES: Record<string, string> = {
  html: 'xml',
  js: 'javascript',
  jsx: 'javascript',
  md: 'markdown',
  sh: 'bash',
  ts: 'typescript',
  tsx: 'typescript',
  yml: 'yaml',
};

const CODE_BLOCK_LANGUAGE_LABELS: Record<string, string> = {
  arduino: 'Arduino',
  auto: 'Auto',
  bash: 'Bash',
  c: 'C',
  cpp: 'C++',
  csharp: 'C#',
  css: 'CSS',
  diff: 'Diff',
  dockerfile: 'Dockerfile',
  go: 'Go',
  graphql: 'GraphQL',
  ini: 'INI',
  java: 'Java',
  javascript: 'JavaScript',
  json: 'JSON',
  kotlin: 'Kotlin',
  less: 'Less',
  lua: 'Lua',
  makefile: 'Makefile',
  markdown: 'Markdown',
  objectivec: 'Objective-C',
  perl: 'Perl',
  php: 'PHP',
  'php-template': 'PHP Template',
  plaintext: 'Plain Text',
  python: 'Python',
  'python-repl': 'Python REPL',
  r: 'R',
  ruby: 'Ruby',
  rust: 'Rust',
  scss: 'SCSS',
  shell: 'Shell',
  sql: 'SQL',
  swift: 'Swift',
  typescript: 'TypeScript',
  vbnet: 'VB.Net',
  wasm: 'WebAssembly',
  xml: 'HTML / XML',
  yaml: 'YAML',
};

export const normalizeCodeBlockLanguage = (
  language?: string | null
): string | null => {
  const value = language?.trim().toLowerCase();

  if (!value) return null;

  return CODE_BLOCK_LANGUAGE_ALIASES[value] ?? value;
};

export const getCodeBlockLanguageLabel = (
  language?: string | null
): string | null => {
  const value = normalizeCodeBlockLanguage(language);

  if (!value) return null;

  return CODE_BLOCK_LANGUAGE_LABELS[value] ?? language?.trim() ?? value;
};
