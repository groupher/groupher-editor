import type { SlateElementProps } from 'platejs/static';

import { isOrderedList } from '@platejs/list';

export function BlockListStatic(props: SlateElementProps) {
  const { checked, listStart, listStyleType } = props.element;
  const ListTag = isOrderedList(props.element) ? 'ol' : 'ul';
  const isTodo = listStyleType === 'todo';

  return (
    <ListTag
      className="relative m-0 p-0"
      start={typeof listStart === 'number' ? listStart : undefined}
      style={{ listStyleType: isTodo ? 'none' : String(listStyleType) }}
    >
      <li className={isTodo && checked ? 'line-through' : undefined}>
        {isTodo && (
          <input
            type="checkbox"
            checked={Boolean(checked)}
            disabled
            readOnly
          />
        )}
        {props.children}
      </li>
    </ListTag>
  );
}
