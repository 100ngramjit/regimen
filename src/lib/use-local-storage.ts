'use client';
import { useState, useEffect, useRef } from 'react';

export function useLocalStorage<T>(key: string, initial: T): [T, (val: T) => void] {
  // Use a ref to track if we've initialized from localStorage
  const isInitialized = useRef(false);
  const [value, setValue] = useState<T>(initial);

  // Load from storage on mount (client-only)
  useEffect(() => {
    if (isInitialized.current) return;
    
    try {
      const item = localStorage.getItem(key);
      if (item !== null) {
        setValue(JSON.parse(item) as T);
      }
      isInitialized.current = true;
    } catch (e) {
      console.warn(`Error reading localStorage key "${key}":`, e);
    }
  }, [key]);

  // Sync with other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setValue(JSON.parse(e.newValue) as T);
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  const set = (val: T) => {
    setValue(val);
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn(`Error writing localStorage key "${key}":`, e);
    }
  };

  return [value, set];
}
