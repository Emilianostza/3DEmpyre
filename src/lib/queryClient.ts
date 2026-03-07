import { QueryClient } from '@tanstack/react-query';

/**
 * Shared QueryClient instance for TanStack Query.
 *
 * Defaults:
 * - staleTime: 2 minutes (data is considered fresh, no refetch)
 * - gcTime: 10 minutes (unused cache entries are garbage-collected)
 * - retry: 1 attempt (ApiClient already retries 5xx/network errors)
 * - refetchOnWindowFocus: true (re-validate when user returns to tab)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0, // Don't retry mutations — let the UI handle errors
    },
  },
});
