'use client';
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initial: T): [T, (val: T) => void] {
  const [value, setValue] = useState<T>(initial);

  // Load from storage on mount (client-only)
  useEffect(() => {
    try {
      const item = localStorage.getItem(key);
      if (item !== null) setValue(JSON.parse(item) as T);
    } catch {}
  }, [key]);

  const set = (val: T) => {
    setValue(val);
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {}
  };

  return [value, set];
}
