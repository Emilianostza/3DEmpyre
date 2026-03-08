import { useSearchParams } from 'react-router-dom';
import { useCallback } from 'react';

/**
 * Syncs a single URL search parameter with React state.
 *
 * - Reads the current value from `?key=...` in the URL
 * - Provides a setter that updates only that param (preserving others)
 * - Uses `replace: true` to avoid polluting browser history
 * - Removes the param when it matches `defaultValue` (keeps URLs clean)
 *
 * @example
 *   const [search, setSearch] = useUrlSearchParam('search');
 *   // URL: /app/dashboard?search=Bistro
 *   // search === 'Bistro'
 */
export function useUrlSearchParam(key: string, defaultValue = '') {
  const [searchParams, setSearchParams] = useSearchParams();
  const value = searchParams.get(key) ?? defaultValue;

  const setValue = useCallback(
    (newValue: string | null) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (newValue === null || newValue === '' || newValue === defaultValue) {
            next.delete(key);
          } else {
            next.set(key, newValue);
          }
          return next;
        },
        { replace: true },
      );
    },
    [key, defaultValue, setSearchParams],
  );

  return [value, setValue] as const;
}
