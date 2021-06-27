import React, { useMemo } from 'react';
import { makeAtomFamilyWithInfiniteQuery } from 'jotai-query-toolkit';
import { atomWithDefault, useAtomValue, useUpdateAtom } from 'jotai/utils';
import { atom, useAtom } from 'jotai';

function defaultGetNextOffset(options: { limit: number; offset: number; total: number }) {
  const { limit, offset, total } = options;
  const sum = offset + limit;
  return sum < total ? sum : false;
}

const MAINNET_URL = 'https://stacks-node-api.mainnet.stacks.co';
const TESTNET_URL = 'https://stacks-node-api.testnet.stacks.co';
const REGTEST_URL = 'https://stacks-node-api.regtest.stacks.co';

const networkUrlAtom = atom(TESTNET_URL);

export const transactionsList = makeAtomFamilyWithInfiniteQuery<[string, string], any>(
  'ACCOUNT_ASSETS',
  async (get, [[principal, networkUrl], { limit, offset }]) => {
    const res = await fetch(
      `${networkUrl}/extended/v1/address/${principal}/assets?limit=${limit}&offset=${offset}`
    );
    return (await res.json()) as any;
  },
  {
    limit: 20,
    getNextOffset: defaultGetNextOffset,
  }
);

const PRINCIPAL = 'ST1X6M947Z7E58CNE0H8YJVJTVKS9VW0PHEG3NHN3';
const txAtom = transactionsList({
  refetchInterval: 2500,
});
export const Component = () => {
  const networkUrl = useAtomValue(networkUrlAtom);
  const [[data, status], dispatch] = useAtom(txAtom([PRINCIPAL, networkUrl]));
  const updateNetwork = useUpdateAtom(networkUrlAtom);

  return (
    <>
      <>
        <button onClick={() => updateNetwork(TESTNET_URL)}>set testnet network</button>
        <button onClick={() => updateNetwork(REGTEST_URL)}>set regtest network</button>
        <button onClick={() => updateNetwork(MAINNET_URL)}>set mainnet network</button>
        <button onClick={() => dispatch({ type: 'next' })}>next page</button>
      </>
      <pre>{JSON.stringify(status, null, '  ')}</pre>
      <pre>{JSON.stringify(data.length, null, '  ')}</pre>
    </>
  );
};
