'use client';

import * as React from 'react';

import type { PlateElementProps } from 'platejs/react';

import {
  ChevronRightIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  LightbulbIcon,
  ListIcon,
  ListOrdered,
  PanelsTopLeftIcon,
  PilcrowIcon,
  Quote,
  Square,
} from 'lucide-react';
import { type TComboboxInputElement, KEYS } from 'platejs';
import { PlateElement } from 'platejs/react';

import { applyBlockActionValue } from '@/components/editor/block-actions';
import { useI18n } from '@/i18n';
import { createTabsElement, TABS_KEYS } from '@/tabs';

import {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxGroup,
  InlineComboboxGroupLabel,
  InlineComboboxInput,
  InlineComboboxItem,
} from './inline-combobox';

type TGroupItem = {
	icon: React.ReactNode;
	value: string;
	keywords?: string[];
	label: string;
};

export function SlashInputElement(
  props: PlateElementProps<TComboboxInputElement>
) {
  const { editor, element } = props;
  const i18n = useI18n();
  const applySlashAction = (value: string) => {
    if (value !== TABS_KEYS.group) {
      applyBlockActionValue(editor, value);
      return;
    }

    const inputPath = editor.api.findPath(element);
    const blockEntry =
      (inputPath ? editor.api.block({ at: inputPath }) : undefined) ??
      editor.api.block();
    if (!blockEntry) return;

    const [, blockPath] = blockEntry;
    editor.tf.withoutNormalizing(() => {
      editor.tf.removeNodes({ at: blockPath });
      editor.tf.insertNodes(createTabsElement(), { at: blockPath });
    });
    editor.tf.select(editor.api.start([...blockPath, 0, 0]));
    editor.tf.focus();
  };

  const groups = React.useMemo(
    () =>
      [
        {
          group: i18n.slash.groups.blocks,
          items: [
            {
              icon: <PilcrowIcon />,
              keywords: ['paragraph'],
              label: i18n.slash.items.paragraph,
              value: KEYS.p,
            },
            {
              icon: <Heading1Icon />,
              keywords: ['h1'],
              label: i18n.slash.items.heading1,
              value: KEYS.h1,
            },
            {
              icon: <Heading2Icon />,
              keywords: ['h2'],
              label: i18n.slash.items.heading2,
              value: KEYS.h2,
            },
            {
              icon: <Heading3Icon />,
              keywords: ['h3'],
              label: i18n.slash.items.heading3,
              value: KEYS.h3,
            },
            {
              icon: <ChevronRightIcon />,
              keywords: ['toggle'],
              label: i18n.slash.items.toggle,
              value: KEYS.toggle,
            },
            {
              icon: <LightbulbIcon />,
              keywords: ['callout'],
              label: i18n.slash.items.callout,
              value: KEYS.callout,
            },
            {
              icon: <Quote />,
              keywords: ['quote', 'blockquote'],
              label: i18n.slash.items.blockquote,
              value: KEYS.blockquote,
            },
            {
              icon: <PanelsTopLeftIcon />,
              keywords: ['tabs', 'tab', 'sdk', 'language'],
              label: i18n.slash.items.tabs,
              value: TABS_KEYS.group,
            },
          ],
        },
        {
          group: i18n.slash.groups.lists,
          items: [
            {
              icon: <ListIcon />,
              keywords: ['unordered', 'ul', '-'],
              label: i18n.slash.items.bulletedList,
              value: KEYS.ul,
            },
            {
              icon: <ListOrdered />,
              keywords: ['ordered', 'ol', '1'],
              label: i18n.slash.items.numberedList,
              value: KEYS.ol,
            },
            {
              icon: <Square />,
              keywords: ['todo', 'task', 'checkbox'],
              label: i18n.slash.items.todoList,
              value: KEYS.listTodo,
            },
          ],
        },
		] as Array<{ group: string; items: TGroupItem[] }>,
    [i18n]
  );

  return (
    <PlateElement {...props} as="span">
      <InlineCombobox element={element} trigger="/">
        <InlineComboboxInput />

        <InlineComboboxContent>
          <InlineComboboxEmpty>{i18n.slash.empty}</InlineComboboxEmpty>

          {groups.map(({ group, items }) => (
            <InlineComboboxGroup key={group}>
              <InlineComboboxGroupLabel>{group}</InlineComboboxGroupLabel>

              {items.map(({ icon, keywords, label, value }) => (
                <InlineComboboxItem
                  key={value}
                  value={value}
                  onClick={() => applySlashAction(value)}
                  label={label}
                  group={group}
                  keywords={keywords}
                >
                  <div className="mr-2 text-muted-foreground">{icon}</div>
                  {label}
                </InlineComboboxItem>
              ))}
            </InlineComboboxGroup>
          ))}
        </InlineComboboxContent>
      </InlineCombobox>

      {props.children}
    </PlateElement>
  );
}
