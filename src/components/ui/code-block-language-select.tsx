'use client';

import { ChevronDownIcon } from 'lucide-react';
import type { TCodeBlockElement } from 'platejs';
import { useEditorRef, useElement, useReadOnly } from 'platejs/react';

import {
  getCodeBlockLanguageLabel,
  normalizeCodeBlockLanguage,
} from '@/code-block';
import { CODE_BLOCK_LANGUAGES } from '@/code-block-lowlight';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function CodeBlockLanguageSelect() {
  const editor = useEditorRef();
  const element = useElement<TCodeBlockElement>();
  const readOnly = useReadOnly();
  const value = normalizeCodeBlockLanguage(element.lang) ?? 'plaintext';
  const label = getCodeBlockLanguageLabel(value) ?? 'Plain Text';

  if (readOnly) {
    return (
      <span className="flex h-7 items-center px-2 text-muted-foreground text-xs">
        {label}
      </span>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Select code language"
          className="h-7 gap-1 px-2 text-muted-foreground text-xs"
          size="sm"
          type="button"
          variant="ghost"
        >
          {label}
          <ChevronDownIcon className="size-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-80 w-48">
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(language) => {
            editor.tf.setNodes<TCodeBlockElement>(
              { lang: language },
              { at: element }
            );
          }}
        >
          {CODE_BLOCK_LANGUAGES.map((language) => (
            <DropdownMenuRadioItem
              className="cursor-pointer"
              key={language.value}
              value={language.value}
            >
              {language.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
