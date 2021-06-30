import React from 'react';
import { ReactQueryDevtools } from 'react-query/devtools';

import { useAtomValue } from 'jotai/utils';
import { Toaster } from 'react-hot-toast';
import { Provider, useAtom } from 'jotai';
import { QueryClient, QueryClientProvider } from 'react-query';
import { atomWithQuery, queryClientAtom } from 'jotai/query';
import {
  atomFamilyWithInfiniteQuery,
  queryKeyStatusAtom,
  infiniteQueryKeyStatusAtom,
  makeAtomFamilyWithInfiniteQuery,
} from 'jotai-query-toolkit';

const makeAtom = makeAtomFamilyWithInfiniteQuery<string, { count: string }>(
  'something-cool',
  async (get, param, context) => {
    await new Promise(resolve => setTimeout(resolve, 1250));
    const { pageParam } = context;
    return { count: pageParam || '0' };
  },
  {
    getNextPageParam: lastPage => {
      const { count } = lastPage;
      if (parseInt(count) === 5) return undefined;
      return (parseInt(count) + 1).toString();
    },
    getPreviousPageParam: lastPage => {
      const { count } = lastPage;
      return (parseInt(count) - 1).toString();
    },
  }
);

const someAtom = atomFamilyWithInfiniteQuery<string, { count: string }>(
  'some-family',
  async (get, param, context) => {
    await new Promise(resolve => setTimeout(resolve, 1250));
    const { pageParam } = context;
    return { count: pageParam || '0' };
  },
  {
    getNextPageParam: lastPage => {
      const { count } = lastPage;
      if (parseInt(count) === 5) return undefined;
      return (parseInt(count) + 1).toString();
    },
    getPreviousPageParam: lastPage => {
      const { count } = lastPage;
      return (parseInt(count) - 1).toString();
    },
  }
);

const anotherAtom = atomWithQuery({
  queryKey: 'test',
  queryFn: () => {
    return 'hello';
  },
  refetchInterval: 1500,
  staleTime: 50,
});

const Comp = () => {
  const theAtom = makeAtom()('test');
  const [data, dispatch] = useAtom(theAtom);

  const thing = useAtomValue(anotherAtom);
  const status = useAtomValue(infiniteQueryKeyStatusAtom(['some-family', 'test']));
  const status2 = useAtomValue(queryKeyStatusAtom(['test']));
  const handleRefetch = () => dispatch({ type: 'refetch' });
  const handleFetchNextPage = () => dispatch({ type: 'fetchNextPage' });
  const handleFetchPreviousPage = () => dispatch({ type: 'fetchPreviousPage' });
  return (
    <>
      <button onClick={() => handleRefetch()}>refetch</button>
      <button onClick={() => handleFetchNextPage()}>next</button>
      <button onClick={() => handleFetchPreviousPage()}>previous</button>
      <div>{JSON.stringify(status2)}</div>
      <div>
        {data.pages.map(page => (
          <div>count: {page.count}</div>
        ))}
      </div>
    </>
  );
};

const DevTools = () => {
  const queryClient = useAtomValue(queryClientAtom);
  if (!queryClient) return null;
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

function App() {
  return (
    <Provider initialValues={[[queryClientAtom, new QueryClient()] as const]}>
      <DevTools />
      <React.Suspense fallback={<>Loading...</>}>
        <Comp />
      </React.Suspense>
      <Toaster position="bottom-center" />
    </Provider>
  );
}

export default App;
