import { useEffect, useState, useCallback } from "react";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // Storage full or blocked — fail silently
    console.warn("localStorage write failed for key:", key, e);
  }
}

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => read<T>(key, initial));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setValue(read<T>(key, initial));
    setLoaded(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Sync across tabs — if another tab changes localStorage, update here
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === key) {
        try {
          setValue(e.newValue ? (JSON.parse(e.newValue) as T) : initial);
        } catch {
          // ignore
        }
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const v =
          typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        write(key, v);
        return v;
      });
    },
    [key],
  );

  return [value, update, loaded] as const;
}
