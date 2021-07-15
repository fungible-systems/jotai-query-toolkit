import { createElement } from 'react';
import { useAtomValue } from 'jotai/utils';

import { QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { memo } from 'react';
import { queryClientAtom } from './atoms/react-query/query-client-atom';

export const JqtDevtools = memo(() => {
  if (process.env.NODE_ENV === 'production') return null;
  const client = useAtomValue(queryClientAtom);
  if (!client) return null;
  return createElement(QueryClientProvider, { client }, createElement(ReactQueryDevtools));
});
