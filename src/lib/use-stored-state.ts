import { useEffect, useState } from "react";

export function useStoredState<T>(key: string, initial: T, parse?: (value: unknown) => T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        const stored = JSON.parse(raw) as unknown;
        setValue(parse ? parse(stored) : (stored as T));
      }
    } catch {
      /* ignore unreadable storage */
    }
    setHydrated(true);
  }, [key, parse]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore full storage */
    }
  }, [key, value, hydrated]);

  return [value, setValue, hydrated] as const;
}
