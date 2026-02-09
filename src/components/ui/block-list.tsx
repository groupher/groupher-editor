'use client';

import type * as React from 'react';

import type { TListElement } from 'platejs';

import { isOrderedList } from '@platejs/list';
import {
  useTodoListElement,
  useTodoListElementState,
} from '@platejs/list/react';
import {
  type PlateElementProps,
  type RenderNodeWrapper,
  useReadOnly,
} from 'platejs/react';
import { KEYS } from 'platejs';

import { cn } from '@/lib/utils';

const todoKey = KEYS.listTodo === 'todo' ? 'todo' : KEYS.listTodo;

const config: Record<
  string,
  {
    Li: React.FC<PlateElementProps>;
    Marker: React.FC<PlateElementProps>;
  }
> = {
  [todoKey]: {
    Li: TodoLi,
    Marker: TodoMarker,
  },
};

export const BlockList: RenderNodeWrapper = (props) => {
  if (!props.element.listStyleType) return;

  return (props) => <List {...props} />;
};

function List(props: PlateElementProps) {
  const { listStart, listStyleType } = props.element as TListElement;
  const { Li, Marker } = config[listStyleType] ?? {};
  const List = isOrderedList(props.element) ? 'ol' : 'ul';

  return (
    <List
      className="relative m-0 p-0"
      style={{ listStyleType }}
      start={listStart}
    >
      {Marker && <Marker {...props} />}
      {Li ? <Li {...props} /> : <li>{props.children}</li>}
    </List>
  );
}

function TodoMarker(props: PlateElementProps) {
  const state = useTodoListElementState({ element: props.element });
  const { checkboxProps } = useTodoListElement(state);
  const { checked, onCheckedChange, ...rest } = checkboxProps as {
    checked?: boolean;
    onCheckedChange?: (value: boolean) => void;
  } & React.InputHTMLAttributes<HTMLInputElement>;
  const readOnly = useReadOnly();

  return (
    <span contentEditable={false}>
      <input
        type="checkbox"
        className={cn('-left-6 absolute top-1 size-4 accent-primary')}
        disabled={readOnly}
        checked={!!checked}
        onChange={(event) => onCheckedChange?.(event.target.checked)}
        {...rest}
      />
    </span>
  );
}

function TodoLi(props: PlateElementProps) {
  return (
    <li
      className={cn(
        'list-none',
        (props.element.checked as boolean) &&
          'text-muted-foreground line-through'
      )}
    >
      {props.children}
    </li>
  );
}
