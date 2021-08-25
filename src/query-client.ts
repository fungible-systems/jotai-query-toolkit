import { QueryClient } from 'react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 12, // 12 hours
      notifyOnChangeProps: ['data', 'error'],
    },
  },
});
