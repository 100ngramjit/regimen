'use client';
import { useState, useEffect, useRef } from 'react';

export function useDbState<T>(key: string, initial: T): [T, (val: T) => void, boolean] {
  const [value, setValue] = useState<T>(initial);
  const [isLoading, setIsLoading] = useState(true);
  const isInitialized = useRef(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/user-state?key=${encodeURIComponent(key)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.value !== null) {
            setValue(data.value);
          }
        }
      } catch (e) {
        console.warn(`Error reading DB state for key "${key}":`, e);
      } finally {
        setIsLoading(false);
        isInitialized.current = true;
      }
    }
    load();
  }, [key]);

  const set = async (val: T) => {
    setValue(val);
    try {
      await fetch('/api/user-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: val }),
      });
    } catch (e) {
      console.warn(`Error writing DB state for key "${key}":`, e);
    }
  };

  return [value, set, isLoading];
}
