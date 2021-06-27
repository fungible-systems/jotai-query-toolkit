import deepEqual from 'fast-deep-equal';
import { atom } from 'jotai';
import { atomWithQuery, queryClientAtom } from 'jotai/query';
import { hashQueryKey, QueryKey } from 'react-query';
import { makeQueryKey } from '../utils';
import { initialDataAtom } from './intitial-data-atom';
import { IS_SSR, QueryRefreshRates } from '../constants';
import { AtomWithQueryRefreshOptions, AtomWithQueryRefreshQueryFn } from './types';

export const atomWithQueryRefresh = <Data>(
  key: string,
  queryFn: AtomWithQueryRefreshQueryFn<Data>,
  options: AtomWithQueryRefreshOptions<Data> = {}
) => {
  const { equalityFn = deepEqual, getShouldRefetch, refetchInterval, ...rest } = options;
  let shouldRefresh = true;

  const queryKey = makeQueryKey(key);
  const queryAtom = atomWithQuery(get => {
    const initialData = (get(initialDataAtom(queryKey)) as unknown as Data) || undefined;
    if (getShouldRefetch && initialData) shouldRefresh = getShouldRefetch(initialData);
    return {
      queryKey,
      queryFn: () => queryFn(get),
      initialData,
      keepPreviousData: true,
      refetchInterval: shouldRefresh ? refetchInterval || QueryRefreshRates.Default : false,
      ...rest,
    };
  });
  queryAtom.debugLabel = `atomWithQueryRefresh/queryAtom/${hashQueryKey(queryKey as QueryKey)}`;
  const anAtom = atom<Data, void>(
    get => {
      const initialData = get(initialDataAtom(queryKey)) as unknown as Data;
      if (IS_SSR) {
        return initialData;
      } else {
        const queryData = get(queryAtom);
        return (queryData || initialData) as Data;
      }
    },
    get => {
      const queryClient = get(queryClientAtom);
      void queryClient?.refetchQueries({
        queryKey,
      });
    }
  );
  anAtom.debugLabel = `atomWithQueryRefresh/${hashQueryKey(queryKey as QueryKey)}`;
  return anAtom;
};
