import React from 'react';
import { atomWithQueryRefresh, withInitialQueries, Queries } from 'jotai-query-toolkit';
import { useAtom } from 'jotai';

// some values for demo, not specific to JQT
let count = 0;
let hasMounted = false;

// our query keys
enum HomeQueryKeys {
  FooBar = 'home/FooBar',
}

// our atomWithQueryRefresh
const fooBarAtom = atomWithQueryRefresh(
  HomeQueryKeys.FooBar,
  () => {
    if (hasMounted) count += 3;
    if (!hasMounted) hasMounted = true;
    return `bar ${count} (client rendered, updates every 3 seconds)`;
  },
  { refetchInterval: 3000 }
);

// the component for the atomWithQueryRefresh
const FooBar = () => {
  const [fooBar, refresh] = useAtom(fooBarAtom);
  return (
    <>
      <h2>{fooBar}</h2>
      <button onClick={() => refresh()}>refresh</button>
    </>
  );
};

// our next.js page component
const MyHomePage = () => {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
      <h1>next.js jotai-query-toolkit</h1>
      <FooBar />
    </div>
  );
};

const queries: Queries = [
  [
    HomeQueryKeys.FooBar,
    async (ctx): Promise<string> => {
      return `foo ${count} (initial data on the server, will update in 3 seconds)`;
    },
  ],
];

export default withInitialQueries(MyHomePage)(queries);
