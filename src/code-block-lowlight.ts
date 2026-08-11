import { common, createLowlight } from 'lowlight';

import { getCodeBlockLanguageLabel } from '@/code-block';

type TCodeBlockLanguage = {
  label: string;
  value: string;
};

export const codeBlockLowlight = createLowlight(common);

export const CODE_BLOCK_LANGUAGES: TCodeBlockLanguage[] = [
  { label: 'Auto', value: 'auto' },
  ...codeBlockLowlight
    .listLanguages()
    .map((value) => ({
      label: getCodeBlockLanguageLabel(value) ?? value,
      value,
    }))
    .sort((left, right) => left.label.localeCompare(right.label)),
];
