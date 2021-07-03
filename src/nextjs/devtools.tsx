import React from 'react';
import { useAtomValue } from 'jotai/utils';
import { getQueryClientAtom } from 'jotai/query';
import { QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { memo } from 'react';

export const Devtools = memo(() => {
  if (process.env.NODE_ENV === 'production') return null;
  const queryClient = useAtomValue(getQueryClientAtom);
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
});
