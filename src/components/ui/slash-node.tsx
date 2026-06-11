'use client';

import * as React from 'react';

import type { PlateEditor, PlateElementProps } from 'platejs/react';

import {
  ChevronRightIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  LightbulbIcon,
  ListIcon,
  ListOrdered,
  PilcrowIcon,
  Quote,
  Square,
} from 'lucide-react';
import { type TComboboxInputElement, type TElement, KEYS } from 'platejs';
import { ListStyleType } from '@platejs/list';
import { PlateElement } from 'platejs/react';

import { useI18n } from '@/i18n';

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

const listStyleMap: Record<string, ListStyleType> = {
  [KEYS.ul]: ListStyleType.Disc,
  [KEYS.ol]: ListStyleType.Decimal,
  [KEYS.listTodo]: 'todo' as ListStyleType,
};

const listTypes = new Set(Object.keys(listStyleMap));

const setBlockType = (editor: PlateEditor, type: string) => {
  editor.tf.withoutNormalizing(() => {
    const entries = editor.api.blocks({ mode: 'lowest' });

    for (const [node, path] of entries) {
      if (listTypes.has(type)) {
        editor.tf.setNodes(
          {
            indent: 1,
            listStyleType: listStyleMap[type],
          },
          { at: path }
        );
        continue;
      }

      if ((node as TElement)[KEYS.listType]) {
        editor.tf.unsetNodes([KEYS.listType, 'indent'], { at: path });
      }

      editor.tf.setNodes({ type }, { at: path });
    }
  });
};

export function SlashInputElement(
  props: PlateElementProps<TComboboxInputElement>
) {
  const { editor, element } = props;
  const i18n = useI18n();

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
                  onClick={() => setBlockType(editor, value)}
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
