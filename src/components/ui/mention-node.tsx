'use client';

import * as React from 'react';

import type { PlateElementProps } from 'platejs/react';

import { getMentionOnSelectItem } from '@platejs/mention';
import { PlateElement } from 'platejs/react';

import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import { useMentionContext } from '@/mention-context';

import {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxGroup,
  InlineComboboxInput,
  InlineComboboxItem,
} from './inline-combobox';

const onSelectItem = getMentionOnSelectItem();

export function MentionElement({ element, ...props }: PlateElementProps) {
  const value = (element as { value?: string }).value ?? 'unknown';

  return (
    <PlateElement
      {...props}
      element={element}
      asChild
      className={cn('inline-flex rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand')}
      contentEditable={false}
    >
      <span>@{value}</span>
    </PlateElement>
  );
}

export function MentionInputElement(props: PlateElementProps) {
  const { editor, element } = props;
  const [search, setSearch] = React.useState('');
  const i18n = useI18n();
  const { mentionOptions = [], onMentionSearch } = useMentionContext();

  React.useEffect(() => {
    onMentionSearch?.(search);
  }, [onMentionSearch, search]);

  return (
    <PlateElement {...props} as="span">
      <InlineCombobox
        value={search}
        element={element}
        setValue={setSearch}
        showTrigger={false}
        trigger="@"
        filter={({ value }, query) => {
          if (query.length === 0) return true;

          return value.toLowerCase().includes(query.toLowerCase());
        }}
      >
        <span className="inline-block rounded-md bg-brand/10 px-1.5 py-0.5 align-baseline text-sm font-semibold text-brand ring-ring focus-within:ring-2">
          @
          <InlineComboboxInput />
        </span>

        <InlineComboboxContent className="my-1.5">
          <InlineComboboxEmpty>{i18n.mention.empty}</InlineComboboxEmpty>

          <InlineComboboxGroup>
            {mentionOptions.map((item) => (
              <InlineComboboxItem
                key={item.key}
                value={item.text}
                onClick={() => onSelectItem(editor, item, search)}
              >
                {item.text}
              </InlineComboboxItem>
            ))}
          </InlineComboboxGroup>
        </InlineComboboxContent>
      </InlineCombobox>

      {props.children}
    </PlateElement>
  );
}
