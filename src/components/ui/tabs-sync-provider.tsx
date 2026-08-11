'use client';

import * as React from 'react';

import type { TTabsPersist } from '@/tabs';

type TTabsSyncListener = () => void;

type TTabsSyncStore = {
  get: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
  subscribe: (listener: TTabsSyncListener) => () => void;
};

const createTabsSyncStore = (): TTabsSyncStore => {
  const listeners = new Set<TTabsSyncListener>();
  const values = new Map<string, string>();

  return {
    get: (key) => values.get(key),
    set: (key, value) => {
      if (values.get(key) === value) return;

      values.set(key, value);
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener) => {
      listeners.add(listener);

      return () => listeners.delete(listener);
    },
  };
};

const defaultTabsSyncStore = createTabsSyncStore();
const TabsSyncContext = React.createContext<TTabsSyncStore | null>(null);

const storageKey = (syncTabKey: string): string =>
  `groupher:tabs:${syncTabKey}`;

const getStorage = (
  persist: TTabsPersist | undefined
): Storage | undefined => {
  if (typeof window === 'undefined') return;

  try {
    if (persist === 'local') return window.localStorage;
    if (persist === 'session') return window.sessionStorage;
  } catch {
    return;
  }
};

export function TabsSyncProvider({ children }: React.PropsWithChildren) {
  const parentStore = React.useContext(TabsSyncContext);
  const storeRef = React.useRef<TTabsSyncStore | null>(null);

  if (!storeRef.current) storeRef.current = createTabsSyncStore();

  return (
    <TabsSyncContext.Provider value={parentStore ?? storeRef.current}>
      {children}
    </TabsSyncContext.Provider>
  );
}

export const useSyncedTabValue = ({
  availableValues,
  fallbackValue,
  persist,
  syncTabKey,
}: {
  availableValues: string[];
  fallbackValue: string;
  persist?: TTabsPersist;
  syncTabKey?: string;
}) => {
  const store = React.useContext(TabsSyncContext) ?? defaultTabsSyncStore;
  const [localValue, setLocalValue] = React.useState(fallbackValue);
  const globalValue = React.useSyncExternalStore(
    store.subscribe,
    () => (syncTabKey ? store.get(syncTabKey) : undefined),
    () => undefined
  );

  React.useEffect(() => {
    if (availableValues.includes(localValue)) return;

    setLocalValue(fallbackValue);
  }, [availableValues, fallbackValue, localValue]);

  React.useEffect(() => {
    if (!syncTabKey || globalValue) return;

    let storedValue: string | null | undefined;
    try {
      storedValue = getStorage(persist)?.getItem(storageKey(syncTabKey));
    } catch {
      storedValue = undefined;
    }
    if (storedValue && availableValues.includes(storedValue)) {
      store.set(syncTabKey, storedValue);
    }
  }, [availableValues, globalValue, persist, store, syncTabKey]);

  React.useEffect(() => {
    if (!globalValue || !availableValues.includes(globalValue)) return;

    setLocalValue(globalValue);
  }, [availableValues, globalValue]);

  const value =
    syncTabKey && globalValue && availableValues.includes(globalValue)
      ? globalValue
      : localValue;

  const setValue = React.useCallback(
    (nextValue: string) => {
      if (!availableValues.includes(nextValue)) return;

      setLocalValue(nextValue);
      if (!syncTabKey) return;

      store.set(syncTabKey, nextValue);
      try {
        getStorage(persist)?.setItem(storageKey(syncTabKey), nextValue);
      } catch {
        // In-memory synchronization remains available when storage is blocked.
      }
    },
    [availableValues, persist, store, syncTabKey]
  );

  return { setValue, value };
};
