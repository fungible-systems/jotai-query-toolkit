import React from 'react';
import { ReactQueryDevtools } from 'react-query/devtools';

import { atomFamilyWithQuery } from 'jotai-query-toolkit';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import toast, { Toaster } from 'react-hot-toast';
import { atom, Provider, useAtom } from 'jotai';
import { QueryClient, QueryClientProvider, QueryKey } from 'react-query';
import { queryClientAtom } from 'jotai/query';
import { Component } from './test';

let count = '0';
let hasMounted = false;

const oneMore = atom('hello again');
const queryKeyAtom = atom<QueryKey>(async get => {
  await new Promise(resolve => setTimeout(resolve, 2500));
  return get(oneMore) + ' thing';
});

const myAtomFamilyAtom = atomFamilyWithQuery<string, string>(
  'SOME_QUERY_KEY',
  (_get, param) => {
    if (hasMounted) {
      const newCount = parseInt(count) + 3;
      count = newCount.toString();
    } else {
      hasMounted = true;
    }
    return count;
  },
  {
    keepPreviousData: false,
    refetchInterval: 3000,
    initialData: 'first render, 0',
    onSuccess: data => {
      toast(`Updated with new value: ${data}`);
    },
    queryKeyAtom,
  }
);

const Example = () => {
  const value = useAtomValue(myAtomFamilyAtom('hello'));
  return (
    <div
      style={{
        margin: '72px auto',
        maxWidth: '900px',
        textAlign: 'center',
      }}
    >
      <h1>Vite JQT example</h1>
      <h2>{value}</h2>
    </div>
  );
};

const Button = () => {
  const [value, update] = useAtom(queryKeyAtom);
  return <button onClick={() => update((parseInt(value) + 1).toString())}>update key</button>;
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
        <Component />
      </React.Suspense>
      <Toaster position="bottom-center" />
    </Provider>
  );
}

export default App;
