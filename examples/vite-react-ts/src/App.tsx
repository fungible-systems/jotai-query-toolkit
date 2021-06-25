import React from 'react';

import { atomFamilyWithQuery } from 'jotai-query-toolkit';
import { useAtomValue } from 'jotai/utils';
import toast, { Toaster } from 'react-hot-toast';

let count = '0';
let hasMounted = false;

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
    refetchInterval: 3000,
    initialData: 'first render, 0',
    onSuccess: data => {
      toast(`Updated with new value: ${data}`);
    },
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

function App() {
  return (
    <>
      <React.Suspense fallback={<>Loading...</>}>
        <Example />
      </React.Suspense>
      <Toaster position="bottom-center" />
    </>
  );
}

export default App;
