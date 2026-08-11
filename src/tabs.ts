import type { TElement } from 'platejs';

export const TABS_KEYS = {
  group: 'tabs',
  item: 'tab',
} as const;

export type TTabsOrientation = 'horizontal' | 'vertical';
export type TTabsPersist = 'local' | 'none' | 'session';
export type TTabIcon =
  | {
      name: string;
      type: 'lucide';
    }
  | {
      src: string;
      type: 'image';
    }
  | {
      library: 'fontawesome' | 'mintlify' | 'starlight';
      name: string;
      type: 'vendor';
      variant?: string;
    };

export type TTabElement = TElement & {
  children: TElement[];
  label: string;
  value: string;
  anchorId?: string;
  icon?: TTabIcon;
};

export type TTabsElement = TElement & {
  children: TTabElement[];
  defaultValue?: string;
  orientation?: TTabsOrientation;
  persist?: TTabsPersist;
  syncTabKey?: string;
};

const TAB_VALUE_SEPARATOR = '-';
const TAB_IMAGE_SOURCE = /^(?:https?:\/\/|\/|\.{1,2}\/)/;

export const normalizeTabLabel = (
  label: unknown,
  index: number
): string => {
  const value = typeof label === 'string' ? label.trim() : '';

  return value || `Tab ${index + 1}`;
};

export const slugifyTabValue = (value: string): string => {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, TAB_VALUE_SEPARATOR)
    .replace(/^-+|-+$/g, '');

  return slug || 'tab';
};

export const createUniqueTabValue = (
  preferredValue: string,
  existingValues: Iterable<string>
): string => {
  const existing = new Set(existingValues);
  const base = slugifyTabValue(preferredValue);

  if (!existing.has(base)) return base;

  let suffix = 2;
  while (existing.has(`${base}-${suffix}`)) suffix += 1;

  return `${base}-${suffix}`;
};

export const parseTabIconInput = (value: string): TTabIcon | undefined => {
  const icon = value.trim();
  if (!icon) return;

  if (TAB_IMAGE_SOURCE.test(icon)) return { src: icon, type: 'image' };

  const vendor = icon.match(/^(fontawesome|mintlify|starlight):(.+)$/);
  if (vendor) {
    const name = vendor[2].trim();
    if (!name) return;

    return {
      library: vendor[1] as Extract<TTabIcon, { type: 'vendor' }>['library'],
      name,
      type: 'vendor',
    };
  }

  return { name: icon, type: 'lucide' };
};

export const formatTabIconInput = (icon?: TTabIcon): string => {
  if (!icon) return '';
  if (icon.type === 'image') return icon.src;
  if (icon.type === 'vendor') return `${icon.library}:${icon.name}`;

  return icon.name;
};

export const getTabValue = (tab: TTabElement, index: number): string => {
  const value = typeof tab.value === 'string' ? tab.value.trim() : '';

  return value || `${slugifyTabValue(normalizeTabLabel(tab.label, index))}-${index + 1}`;
};

export const getTabsInitialValue = (tabs: TTabsElement): string => {
  const values = tabs.children.map(getTabValue);
  const defaultValue =
    typeof tabs.defaultValue === 'string' ? tabs.defaultValue.trim() : '';

  return defaultValue && values.includes(defaultValue)
    ? defaultValue
    : (values[0] ?? '');
};

export const createTabElement = (
  index: number,
  existingValues: Iterable<string> = []
): TTabElement => {
  const label = `Tab ${index + 1}`;

  return {
    children: [{ children: [{ text: '' }], type: 'p' }],
    label,
    type: TABS_KEYS.item,
    value: createUniqueTabValue(label, existingValues),
  };
};

export const createTabsElement = (): TTabsElement => {
  const first = createTabElement(0);
  const second = createTabElement(1, [first.value]);

  return {
    children: [first, second],
    defaultValue: first.value,
    type: TABS_KEYS.group,
  };
};
