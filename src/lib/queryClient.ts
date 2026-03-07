import { QueryClient } from '@tanstack/react-query';

/**
 * Shared QueryClient instance for TanStack Query.
 *
 * Defaults tuned for Cloudflare edge caching:
 * - staleTime: 5 minutes (data is considered fresh, no refetch)
 * - gcTime: 15 minutes (unused cache entries are garbage-collected)
 * - retry: 1 attempt (ApiClient already retries 5xx/network errors)
 * - refetchOnWindowFocus: false (avoid unnecessary refetches on tab switch)
 * - refetchOnReconnect: true (re-validate after network recovery)
 *
 * Override staleTime per-query for volatile data (e.g. notifications).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 15 * 60 * 1000, // 15 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0, // Don't retry mutations — let the UI handle errors
    },
  },
});
