import type { Value } from 'platejs';

import { StrictMode, useEffect, useMemo, useState } from 'react';

import {
  Editor,
  EditorContainer,
  EditorView,
} from '@/components/ui/editor';
import { FixedToolbar } from '@/components/ui/fixed-toolbar';
import { MarkToolbarButton } from '@/components/ui/mark-toolbar-button';
import { BasicBlocksKit } from '@/components/editor/plugins/basic-blocks-kit';
import { BasicMarksKit } from '@/components/editor/plugins/basic-marks-kit';
import { CustomElementsKit } from '@/components/editor/plugins/custom-elements-kit';
import { getMessages, type Locale } from '@/lib/i18n';

import {
  Editor as SlateEditor,
  Element as SlateElement,
  Range,
  Transforms,
} from 'platejs';
import {
  Plate,
  useEditorReadOnly,
  useEditorRef,
  useEditorSelection,
  usePlateEditor,
  usePlateViewEditor,
} from 'platejs/react';
import { ReactEditor } from 'slate-react';

const initialValue: Value = [
  {
    type: 'p',
    children: [
      { text: 'Hello! Try out the ' },
      { text: 'bold', bold: true },
      { text: ', ' },
      { text: 'italic', italic: true },
      { text: ', and ' },
      { text: 'underline', underline: true },
      { text: ' formatting.' },
    ],
  },
];

type SlashItem = {
  key: string;
  title: string;
  description?: string;
  action: (editor: SlateEditor) => void;
};

type MentionItem = {
  key: string;
  label: string;
};

const mentionCandidates: MentionItem[] = [
  { key: 'luna', label: 'Luna' },
  { key: 'miles', label: 'Miles' },
  { key: 'sophia', label: 'Sophia' },
  { key: 'kai', label: 'Kai' },
];

const unwrapLists = (editor: SlateEditor) => {
  Transforms.unwrapNodes(editor, {
    match: (node) =>
      !SlateEditor.isEditor(node) &&
      SlateElement.isElement(node) &&
      ['bulleted-list', 'numbered-list'].includes(node.type as string),
    split: true,
  });
};

const toggleBlock = (editor: SlateEditor, type: string) => {
  const isActive = Array.from(
    SlateEditor.nodes(editor, {
      match: (node) =>
        !SlateEditor.isEditor(node) &&
        SlateElement.isElement(node) &&
        (node as { type?: string }).type === type,
    })
  ).length > 0;

  Transforms.setNodes(
    editor,
    { type: isActive ? 'p' : type },
    {
      match: (node) =>
        !SlateEditor.isEditor(node) &&
        SlateElement.isElement(node),
    }
  );
};

const wrapList = (editor: SlateEditor, listType: 'bulleted-list' | 'numbered-list') => {
  unwrapLists(editor);
  Transforms.setNodes(
    editor,
    { type: 'list-item' },
    {
      match: (node) =>
        !SlateEditor.isEditor(node) &&
        SlateElement.isElement(node) &&
        (node as { type?: string }).type !== 'list-item',
    }
  );
  Transforms.wrapNodes(
    editor,
    { type: listType, children: [] },
    {
      match: (node) =>
        !SlateEditor.isEditor(node) &&
        SlateElement.isElement(node) &&
        (node as { type?: string }).type === 'list-item',
    }
  );
};

const insertTodo = (editor: SlateEditor) => {
  Transforms.setNodes(
    editor,
    { type: 'todo-list-item', checked: false },
    {
      match: (node) =>
        !SlateEditor.isEditor(node) &&
        SlateElement.isElement(node),
    }
  );
};

const insertToggle = (editor: SlateEditor) => {
  Transforms.setNodes(
    editor,
    { type: 'toggle', collapsed: false },
    {
      match: (node) =>
        !SlateEditor.isEditor(node) &&
        SlateElement.isElement(node),
    }
  );
};

const insertCallout = (editor: SlateEditor) => {
  Transforms.setNodes(
    editor,
    { type: 'callout' },
    {
      match: (node) =>
        !SlateEditor.isEditor(node) &&
        SlateElement.isElement(node),
    }
  );
};

const insertMention = (editor: SlateEditor, mention: MentionItem) => {
  const mentionNode = {
    type: 'mention',
    value: mention.label,
    children: [{ text: '' }],
  };
  Transforms.insertNodes(editor, mentionNode);
  Transforms.move(editor);
};

const isLinkActive = (editor: SlateEditor) => {
  return (
    Array.from(
      SlateEditor.nodes(editor, {
        match: (node) =>
          !SlateEditor.isEditor(node) &&
          SlateElement.isElement(node) &&
          (node as { type?: string }).type === 'link',
      })
    ).length > 0
  );
};

const unwrapLink = (editor: SlateEditor) => {
  Transforms.unwrapNodes(editor, {
    match: (node) =>
      !SlateEditor.isEditor(node) &&
      SlateElement.isElement(node) &&
      (node as { type?: string }).type === 'link',
  });
};

const wrapLink = (editor: SlateEditor, url: string) => {
  if (isLinkActive(editor)) {
    unwrapLink(editor);
  }

  const { selection } = editor;
  const link = { type: 'link', url, children: [] as Value };

  if (selection && Range.isCollapsed(selection)) {
    Transforms.insertNodes(editor, {
      ...link,
      children: [{ text: url }],
    });
  } else {
    Transforms.wrapNodes(editor, link, { split: true });
    Transforms.collapse(editor, { edge: 'end' });
  }
};

function FloatingSelectionToolbar({ locale }: { locale: Locale }) {
  const editor = useEditorRef();
  const selection = useEditorSelection();
  const readOnly = useEditorReadOnly();
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const messages = getMessages(locale);

  const shouldShow =
    !readOnly &&
    selection &&
    !Range.isCollapsed(selection) &&
    SlateEditor.string(editor, selection) !== '';

  useEffect(() => {
    if (!shouldShow) {
      setPosition(null);
      return;
    }

    const domRange = ReactEditor.toDOMRange(editor, selection);
    const rect = domRange.getBoundingClientRect();
    setPosition({
      top: rect.top + window.scrollY - 48,
      left: rect.left + window.scrollX + rect.width / 2,
    });
  }, [editor, selection, shouldShow]);

  if (!shouldShow || !position) return null;

  return (
    <div
      className="absolute z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-background px-2 py-1 shadow"
      style={{ top: position.top, left: position.left }}
    >
      <MarkToolbarButton nodeType="bold" tooltip={messages.selectionToolbar.bold}>
        B
      </MarkToolbarButton>
      <MarkToolbarButton nodeType="italic" tooltip={messages.selectionToolbar.italic}>
        I
      </MarkToolbarButton>
      <MarkToolbarButton nodeType="underline" tooltip={messages.selectionToolbar.underline}>
        U
      </MarkToolbarButton>
      <MarkToolbarButton
        nodeType="strikethrough"
        tooltip={messages.selectionToolbar.strikethrough}
      >
        S
      </MarkToolbarButton>
      <button
        type="button"
        className="rounded px-2 text-xs font-semibold text-brand hover:bg-brand/10"
        onClick={() => {
          const url = window.prompt(messages.selectionToolbar.link);
          if (!url) return;
          wrapLink(editor, url);
        }}
      >
        {messages.selectionToolbar.link}
      </button>
    </div>
  );
}

function SlashCommandMenu({
  items,
  activeIndex,
  position,
  emptyLabel,
  onSelect,
}: {
  items: SlashItem[];
  activeIndex: number;
  position: { top: number; left: number } | null;
  emptyLabel: string;
  onSelect: (item: SlashItem) => void;
}) {
  if (!position) return null;

  return (
    <div
      className="absolute z-50 w-64 rounded-lg border border-border bg-background p-2 text-sm shadow"
      style={{ top: position.top, left: position.left }}
    >
      {items.length === 0 ? (
        <div className="px-2 py-1 text-muted-foreground">{emptyLabel}</div>
      ) : (
        <ul className="space-y-1">
          {items.map((item, index) => (
            <li key={item.key}>
              <button
                type="button"
                className={`flex w-full flex-col rounded-md px-2 py-1 text-left transition ${
                  index === activeIndex
                    ? 'bg-brand/10 text-brand'
                    : 'hover:bg-muted'
                }`}
                onClick={() => onSelect(item)}
              >
                <span className="font-medium">{item.title}</span>
                {item.description ? (
                  <span className="text-xs text-muted-foreground">
                    {item.description}
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MentionMenu({
  items,
  activeIndex,
  position,
  emptyLabel,
  onSelect,
}: {
  items: MentionItem[];
  activeIndex: number;
  position: { top: number; left: number } | null;
  emptyLabel: string;
  onSelect: (item: MentionItem) => void;
}) {
  if (!position) return null;

  return (
    <div
      className="absolute z-50 w-56 rounded-lg border border-border bg-background p-2 text-sm shadow"
      style={{ top: position.top, left: position.left }}
    >
      {items.length === 0 ? (
        <div className="px-2 py-1 text-muted-foreground">{emptyLabel}</div>
      ) : (
        <ul className="space-y-1">
          {items.map((item, index) => (
            <li key={item.key}>
              <button
                type="button"
                className={`w-full rounded-md px-2 py-1 text-left transition ${
                  index === activeIndex
                    ? 'bg-brand/10 text-brand'
                    : 'hover:bg-muted'
                }`}
                onClick={() => onSelect(item)}
              >
                @{item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function App() {
  const [locale, setLocale] = useState<Locale>('zh');
  const messages = getMessages(locale);
  const plugins = useMemo(
    () => [...BasicMarksKit, ...BasicBlocksKit, ...CustomElementsKit],
    []
  );

  const editor = usePlateEditor({
    plugins,
    value: initialValue,
  });

  const [value, setValue] = useState<Value>(initialValue);
  const [exportedJson, setExportedJson] = useState('');
  const [readonlyValue, setReadonlyValue] = useState<Value>(initialValue);
  const [readonlyError, setReadonlyError] = useState('');

  const [slashTarget, setSlashTarget] = useState<Range | null>(null);
  const [slashSearch, setSlashSearch] = useState('');
  const [slashIndex, setSlashIndex] = useState(0);
  const [slashPosition, setSlashPosition] = useState<{ top: number; left: number } | null>(null);

  const [mentionTarget, setMentionTarget] = useState<Range | null>(null);
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentionIndex, setMentionIndex] = useState(0);
  const [mentionPosition, setMentionPosition] = useState<{ top: number; left: number } | null>(null);

  const slashItems = useMemo<SlashItem[]>(
    () => [
      {
        key: 'h1',
        title: messages.slash.items.h1,
        action: (editorInstance) => toggleBlock(editorInstance, 'h1'),
      },
      {
        key: 'h2',
        title: messages.slash.items.h2,
        action: (editorInstance) => toggleBlock(editorInstance, 'h2'),
      },
      {
        key: 'h3',
        title: messages.slash.items.h3,
        action: (editorInstance) => toggleBlock(editorInstance, 'h3'),
      },
      {
        key: 'bulleted',
        title: messages.slash.items.bulleted,
        action: (editorInstance) => wrapList(editorInstance, 'bulleted-list'),
      },
      {
        key: 'numbered',
        title: messages.slash.items.numbered,
        action: (editorInstance) => wrapList(editorInstance, 'numbered-list'),
      },
      {
        key: 'todo',
        title: messages.slash.items.todo,
        action: insertTodo,
      },
      {
        key: 'toggle',
        title: messages.slash.items.toggle,
        action: insertToggle,
      },
      {
        key: 'callout',
        title: messages.slash.items.callout,
        action: insertCallout,
      },
      {
        key: 'blockquote',
        title: messages.slash.items.blockquote,
        action: (editorInstance) => toggleBlock(editorInstance, 'blockquote'),
      },
    ],
    [messages]
  );

  const filteredSlashItems = slashItems.filter((item) =>
    item.title.toLowerCase().includes(slashSearch.toLowerCase())
  );

  const filteredMentionItems = mentionCandidates.filter((item) =>
    item.label.toLowerCase().includes(mentionSearch.toLowerCase())
  );

  const viewEditor = usePlateViewEditor({
    plugins,
    value: readonlyValue,
  });

  const selectSlashItem = (item: SlashItem) => {
    if (!slashTarget) return;
    Transforms.select(editor, slashTarget);
    Transforms.delete(editor);
    item.action(editor);
    setSlashTarget(null);
  };

  const selectMentionItem = (item: MentionItem) => {
    if (!mentionTarget) return;
    Transforms.select(editor, mentionTarget);
    Transforms.delete(editor);
    insertMention(editor, item);
    setMentionTarget(null);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (slashTarget) {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSlashIndex((prev) =>
            prev >= filteredSlashItems.length - 1 ? 0 : prev + 1
          );
          return;
        case 'ArrowUp':
          event.preventDefault();
          setSlashIndex((prev) =>
            prev <= 0 ? filteredSlashItems.length - 1 : prev - 1
          );
          return;
        case 'Tab':
        case 'Enter':
          event.preventDefault();
          const item = filteredSlashItems[slashIndex];
          if (item) {
            selectSlashItem(item);
          }
          return;
        case 'Escape':
          event.preventDefault();
          setSlashTarget(null);
          return;
        default:
          break;
      }
    }

    if (mentionTarget) {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setMentionIndex((prev) =>
            prev >= filteredMentionItems.length - 1 ? 0 : prev + 1
          );
          return;
        case 'ArrowUp':
          event.preventDefault();
          setMentionIndex((prev) =>
            prev <= 0 ? filteredMentionItems.length - 1 : prev - 1
          );
          return;
        case 'Tab':
        case 'Enter':
          event.preventDefault();
          const mention = filteredMentionItems[mentionIndex];
          if (mention) {
            selectMentionItem(mention);
          }
          return;
        case 'Escape':
          event.preventDefault();
          setMentionTarget(null);
          return;
        default:
          break;
      }
    }
  };

  const handleChange = (updatedValue: Value) => {
    setValue(updatedValue);

    const { selection } = editor;
    if (selection && Range.isCollapsed(selection)) {
      const [start] = Range.edges(selection);
      const wordBefore = SlateEditor.before(editor, start, { unit: 'word' });
      const before = wordBefore && SlateEditor.before(editor, wordBefore);
      const beforeRange = before && SlateEditor.range(editor, before, start);
      const beforeText = beforeRange && SlateEditor.string(editor, beforeRange);
      const after = SlateEditor.after(editor, start);
      const afterRange = after ? SlateEditor.range(editor, start, after) : null;
      const afterText = afterRange ? SlateEditor.string(editor, afterRange) : '';

      const slashMatch =
        beforeText && beforeText.match(/^\/(\w*)$/) && afterText.match(/^\s|$/);

      if (slashMatch && beforeRange) {
        setSlashTarget(beforeRange);
        setSlashSearch(slashMatch[1]);
        setSlashIndex(0);
      } else {
        setSlashTarget(null);
      }

      const mentionMatch =
        beforeText && beforeText.match(/^@(\w*)$/) && afterText.match(/^\s|$/);

      if (mentionMatch && beforeRange) {
        setMentionTarget(beforeRange);
        setMentionSearch(mentionMatch[1]);
        setMentionIndex(0);
      } else {
        setMentionTarget(null);
      }
    }
  };

  const exportJson = () => {
    setExportedJson(JSON.stringify(value, null, 2));
    setReadonlyError('');
  };

  const restoreJson = () => {
    try {
      const parsed = JSON.parse(exportedJson) as Value;
      setReadonlyValue(parsed);
      setReadonlyError('');
    } catch {
      setReadonlyError(messages.export.error);
    }
  };

  useEffect(() => {
    if (!slashTarget) {
      setSlashPosition(null);
      return;
    }
    const domRange = ReactEditor.toDOMRange(editor, slashTarget);
    const rect = domRange.getBoundingClientRect();
    setSlashPosition({
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX,
    });
  }, [editor, slashTarget]);

  useEffect(() => {
    if (!mentionTarget) {
      setMentionPosition(null);
      return;
    }
    const domRange = ReactEditor.toDOMRange(editor, mentionTarget);
    const rect = domRange.getBoundingClientRect();
    setMentionPosition({
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX,
    });
  }, [editor, mentionTarget]);

  return (
    <div className="m-5 flex flex-col gap-6">
      <StrictMode>
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">{messages.editorTitle}</h1>
          <label className="flex items-center gap-2 text-sm">
            {messages.language}
            <select
              className="rounded border border-border bg-background px-2 py-1 text-sm"
              value={locale}
              onChange={(event) => setLocale(event.target.value as Locale)}
            >
              <option value="zh">中文</option>
              <option value="en">English</option>
            </select>
          </label>
        </div>

        <Plate
          editor={editor}
          onChange={({ value: updatedValue }) => handleChange(updatedValue)}
        >
          <FixedToolbar className="justify-start rounded-t-lg">
            <MarkToolbarButton nodeType="bold" tooltip={messages.selectionToolbar.bold}>
              B
            </MarkToolbarButton>
            <MarkToolbarButton nodeType="italic" tooltip={messages.selectionToolbar.italic}>
              I
            </MarkToolbarButton>
            <MarkToolbarButton nodeType="underline" tooltip={messages.selectionToolbar.underline}>
              U
            </MarkToolbarButton>
            <MarkToolbarButton
              nodeType="strikethrough"
              tooltip={messages.selectionToolbar.strikethrough}
            >
              S
            </MarkToolbarButton>
          </FixedToolbar>
          <EditorContainer className="relative">
            <FloatingSelectionToolbar locale={locale} />
            <SlashCommandMenu
              items={filteredSlashItems}
              activeIndex={slashIndex}
              position={slashPosition}
              emptyLabel={messages.slash.empty}
              onSelect={selectSlashItem}
            />
            <MentionMenu
              items={filteredMentionItems}
              activeIndex={mentionIndex}
              position={mentionPosition}
              emptyLabel={messages.mention.empty}
              onSelect={selectMentionItem}
            />
            <Editor
              placeholder={messages.placeholder}
              onKeyDown={handleKeyDown}
            />
          </EditorContainer>
        </Plate>

        <section className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold">{messages.export.title}</h2>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-md bg-brand px-3 py-1 text-sm font-medium text-white"
                onClick={exportJson}
              >
                {messages.export.exportButton}
              </button>
              <button
                type="button"
                className="rounded-md border border-border px-3 py-1 text-sm"
                onClick={restoreJson}
              >
                {messages.export.renderButton}
              </button>
            </div>
          </div>
          <textarea
            className="mt-3 h-40 w-full rounded-md border border-border bg-background p-3 text-xs"
            placeholder={messages.export.placeholder}
            value={exportedJson}
            onChange={(event) => setExportedJson(event.target.value)}
          />
          {readonlyError ? (
            <p className="mt-2 text-sm text-destructive">{readonlyError}</p>
          ) : null}
          <div className="mt-4 rounded-md border border-border bg-background">
            <Plate editor={viewEditor} readOnly>
              <EditorContainer variant="select">
                <EditorView />
              </EditorContainer>
            </Plate>
          </div>
        </section>
      </StrictMode>
    </div>
  );
}
