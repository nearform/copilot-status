import { updateCopilotWidget } from '@/widgets/voltraWidgetService';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryCache, QueryClient } from '@tanstack/react-query';
import { storage } from './storage';

// Create MMKV-based persister for React Query
export const queryPersister = createAsyncStoragePersister({
  storage: {
    getItem: async (key: string) => {
      const value = storage.getString(key);
      return value ?? null;
    },
    setItem: async (key: string, value: string) => {
      storage.set(key, value);
    },
    removeItem: async (key: string) => {
      storage.remove(key);
    },
  },
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => failureCount < 3 && error?.status,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30_000),
      gcTime: Infinity,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: 'always',
      networkMode: 'offlineFirst',
    },
    mutations: {
      retry: 1,
      networkMode: 'offlineFirst',
    },
  },
  queryCache: new QueryCache({
    onSuccess: updateCopilotWidget,
  }),
});

export const persistOptions = { persister: queryPersister };
