'use client';

import * as Popover from '@radix-ui/react-popover';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  GripVerticalIcon,
  MoreHorizontalIcon,
  PlusIcon,
  SaveIcon,
  Trash2Icon,
} from 'lucide-react';
import { PathApi } from 'platejs';
import type { PlateElementProps } from 'platejs/react';
import {
  PlateElement,
  useEditorRef,
  useFocused,
  useReadOnly,
} from 'platejs/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { TabIcon } from '@/components/ui/tab-icon';
import { useSyncedTabValue } from '@/components/ui/tabs-sync-provider';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n';
import {
  createTabElement,
  formatTabIconInput,
  getTabsInitialValue,
  getTabValue,
  parseTabIconInput,
  type TTabElement,
  type TTabsElement,
} from '@/tabs';

type TTabsActionsProps = {
  activeIndex: number;
  activeTab: TTabElement;
  onAdd: () => void;
  onDelete: () => void;
  onMove: (offset: -1 | 1) => void;
  onSave: (properties: Pick<TTabElement, 'icon' | 'label'>) => void;
  tabCount: number;
};

function TabsActions({
  activeIndex,
  activeTab,
  onAdd,
  onDelete,
  onMove,
  onSave,
  tabCount,
}: TTabsActionsProps) {
  const i18n = useI18n();
  const [open, setOpen] = React.useState(false);
  const [icon, setIcon] = React.useState(
    formatTabIconInput(activeTab.icon)
  );
  const [label, setLabel] = React.useState(activeTab.label);

  React.useEffect(() => {
    if (!open) return;

    setIcon(formatTabIconInput(activeTab.icon));
    setLabel(activeTab.label);
  }, [activeTab, open]);

  const save = () => {
    const nextLabel = label.trim();
    if (!nextLabel) return;

    onSave({
      icon:
        icon.trim() === formatTabIconInput(activeTab.icon)
          ? activeTab.icon
          : parseTabIconInput(icon),
      label: nextLabel,
    });
    setOpen(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          aria-label={i18n.tabs.edit}
          className="mr-1 size-7 text-muted-foreground"
          contentEditable={false}
          size="icon"
          type="button"
          variant="ghost"
        >
          <MoreHorizontalIcon className="size-4" />
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          className="z-50 w-64 rounded-lg border border-border/70 bg-popover p-3 text-popover-foreground shadow-lg"
          sideOffset={6}
        >
          <div className="space-y-3">
            <label className="block space-y-1 text-xs font-medium">
              <span>{i18n.tabs.label}</span>
              <input
                className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') save();
                }}
              />
            </label>
            <label className="block space-y-1 text-xs font-medium">
              <span>{i18n.tabs.icon}</span>
              <input
                className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                placeholder={i18n.tabs.iconPlaceholder}
                value={icon}
                onChange={(event) => setIcon(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') save();
                }}
              />
            </label>
            <Button className="w-full" size="sm" type="button" onClick={save}>
              <SaveIcon />
              {i18n.tabs.save}
            </Button>
            <div className="grid grid-cols-2 gap-2 border-t border-border pt-3">
              <Button
                disabled={activeIndex === 0}
                size="sm"
                type="button"
                variant="outline"
                onClick={() => onMove(-1)}
              >
                <ArrowLeftIcon />
                {i18n.tabs.moveLeft}
              </Button>
              <Button
                disabled={activeIndex === tabCount - 1}
                size="sm"
                type="button"
                variant="outline"
                onClick={() => onMove(1)}
              >
                {i18n.tabs.moveRight}
                <ArrowRightIcon />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                type="button"
                variant="outline"
                onClick={onAdd}
              >
                <PlusIcon />
                {i18n.tabs.add}
              </Button>
              <Button
                size="sm"
                type="button"
                variant="destructive"
                onClick={onDelete}
              >
                <Trash2Icon />
                {i18n.tabs.delete}
              </Button>
            </div>
          </div>
          <Popover.Arrow className="fill-popover" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export function TabsElement({
  className,
  ...props
}: PlateElementProps<TTabsElement>) {
  const editor = useEditorRef();
  const i18n = useI18n();
  const focused = useFocused();
  const readOnly = useReadOnly();
  const tabs = props.element;
  const orientation =
    tabs.orientation === 'vertical' ? 'vertical' : 'horizontal';
  const availableValues = tabs.children.map(getTabValue);
  const fallbackValue = getTabsInitialValue(tabs);
  const syncTabKey =
    typeof tabs.syncTabKey === 'string' && tabs.syncTabKey.trim()
      ? tabs.syncTabKey.trim()
      : undefined;
  const { setValue, value } = useSyncedTabValue({
    availableValues,
    fallbackValue,
    persist: tabs.persist,
    syncTabKey,
  });
  const activeIndex = Math.max(0, availableValues.indexOf(value));
  const activeTab = tabs.children[activeIndex] ?? tabs.children[0];
  const pendingValueRef = React.useRef<string | null>(null);
  const previousValueRef = React.useRef(value);
  const [draggedValue, setDraggedValue] = React.useState<string | null>(null);

  React.useEffect(() => {
    const pendingValue = pendingValueRef.current;
    if (!pendingValue || !availableValues.includes(pendingValue)) return;

    pendingValueRef.current = null;
    setValue(pendingValue);
  }, [availableValues, setValue]);

  React.useEffect(() => {
    const previousValue = previousValueRef.current;
    previousValueRef.current = value;
    if (!focused || previousValue === value || !editor.selection) return;

    const groupPath = editor.api.findPath(tabs);
    const previousIndex = availableValues.indexOf(previousValue);
    const nextIndex = availableValues.indexOf(value);
    if (!groupPath || previousIndex < 0 || nextIndex < 0) return;

    const previousPath = [...groupPath, previousIndex];
    if (
      !PathApi.isAncestor(previousPath, editor.selection.anchor.path) &&
      !PathApi.equals(previousPath, editor.selection.anchor.path)
    ) {
      return;
    }

    editor.tf.select(editor.api.start([...groupPath, nextIndex]));
  }, [availableValues, editor, focused, tabs, value]);

  const moveTab = (sourceIndex: number, targetIndex: number) => {
    if (
      sourceIndex === targetIndex ||
      sourceIndex < 0 ||
      targetIndex < 0 ||
      targetIndex >= tabs.children.length
    ) {
      return;
    }

    const groupPath = editor.api.findPath(tabs);
    if (!groupPath) return;

    editor.tf.moveNodes({
      at: [...groupPath, sourceIndex],
      to: [...groupPath, targetIndex],
    });
  };

  const addTab = () => {
    const groupPath = editor.api.findPath(tabs);
    if (!groupPath) return;

    const labels = new Set(tabs.children.map((tab) => tab.label.trim()));
    let nextIndex = 0;
    while (labels.has(`Tab ${nextIndex + 1}`)) nextIndex += 1;

    const nextTab = createTabElement(nextIndex, availableValues);
    const targetIndex = Math.min(activeIndex + 1, tabs.children.length);
    pendingValueRef.current = nextTab.value;
    editor.tf.insertNodes(nextTab, {
      at: [...groupPath, targetIndex],
    });
  };

  const deleteTab = () => {
    const groupPath = editor.api.findPath(tabs);
    if (!groupPath || !activeTab) return;

    if (tabs.children.length === 1) {
      editor.tf.withNewBatch(() => {
        editor.tf.withoutNormalizing(() => {
          editor.tf.unwrapNodes({ at: [...groupPath, 0] });
          editor.tf.unwrapNodes({ at: groupPath });
        });
      });
      return;
    }

    const nextIndex =
      activeIndex < tabs.children.length - 1 ? activeIndex + 1 : activeIndex - 1;
    const nextValue = availableValues[nextIndex];
    setValue(nextValue);
    editor.tf.withNewBatch(() => {
      editor.tf.withoutNormalizing(() => {
        if (tabs.defaultValue?.trim() === availableValues[activeIndex]) {
          editor.tf.setNodes<TTabsElement>(
            { defaultValue: nextValue },
            { at: groupPath }
          );
        }
        editor.tf.removeNodes({ at: [...groupPath, activeIndex] });
      });
    });
  };

  const saveTab = (properties: Pick<TTabElement, 'icon' | 'label'>) => {
    const groupPath = editor.api.findPath(tabs);
    if (!groupPath || !activeTab) return;

    editor.tf.setNodes<TTabElement>(properties, {
      at: [...groupPath, activeIndex],
    });
  };

  return (
    <TabsPrimitive.Root
      activationMode="automatic"
      className="contents"
      orientation={orientation}
      value={value}
      onValueChange={setValue}
    >
      <PlateElement
        {...props}
        className={cn(
          'rich-editor-tabs my-4 overflow-hidden rounded-xl border border-border bg-card',
          orientation === 'vertical' &&
            'grid grid-cols-[minmax(8rem,auto)_minmax(0,1fr)]',
          className
        )}
      >
        <div
          className={cn(
            'rich-editor-tabs-header flex min-w-0 items-center border-border bg-muted/30',
            orientation === 'horizontal'
              ? 'border-b'
              : 'flex-col border-r'
          )}
          contentEditable={false}
        >
          <TabsPrimitive.List
            aria-label={i18n.tabs.listLabel}
            className={cn(
              'flex min-w-0 flex-1 gap-1 overflow-auto p-1',
              orientation === 'vertical' && 'w-full flex-col'
            )}
            loop
          >
            {tabs.children.map((tab, index) => {
              const tabValue = availableValues[index];

              return (
                <TabsPrimitive.Trigger
                  className={cn(
                    'group/tab relative inline-flex min-h-8 min-w-0 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground outline-none transition-colors',
                    'hover:bg-background/70 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50',
                    'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
                    orientation === 'vertical' && 'w-full justify-start',
                    draggedValue === tabValue && 'opacity-40'
                  )}
                  draggable={!readOnly}
                  key={tabValue}
                  value={tabValue}
                  onDragEnd={() => setDraggedValue(null)}
                  onDragOver={(event) => {
                    if (!readOnly && draggedValue) event.preventDefault();
                  }}
                  onDragStart={(event) => {
                    if (readOnly) return;

                    setDraggedValue(tabValue);
                    event.dataTransfer.effectAllowed = 'move';
                    event.dataTransfer.setData(
                      'application/x-groupher-tab',
                      tabValue
                    );
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    const sourceValue =
                      draggedValue ||
                      event.dataTransfer.getData(
                        'application/x-groupher-tab'
                      );
                    moveTab(availableValues.indexOf(sourceValue), index);
                    setDraggedValue(null);
                  }}
                  onMouseDown={(event) => event.stopPropagation()}
                >
                  {!readOnly && (
                    <GripVerticalIcon
                      aria-hidden="true"
                      className="size-3.5 cursor-grab opacity-0 transition-opacity group-hover/tab:opacity-60"
                    />
                  )}
                  <TabIcon icon={tab.icon} />
                  <span className="truncate">{tab.label}</span>
                </TabsPrimitive.Trigger>
              );
            })}
          </TabsPrimitive.List>
          {!readOnly && activeTab && (
            <TabsActions
              activeIndex={activeIndex}
              activeTab={activeTab}
              tabCount={tabs.children.length}
              onAdd={addTab}
              onDelete={deleteTab}
              onMove={(offset) => moveTab(activeIndex, activeIndex + offset)}
              onSave={saveTab}
            />
          )}
        </div>
        {props.children}
      </PlateElement>
    </TabsPrimitive.Root>
  );
}
