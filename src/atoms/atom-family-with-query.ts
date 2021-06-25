import deepEqual from 'fast-deep-equal';
import { atom, Getter } from 'jotai';
import { atomWithQuery as _atomWithQuery, queryClientAtom } from 'jotai/query';
import { atomFamily } from 'jotai/utils';
import { hashQueryKey, QueryKey, QueryObserverOptions } from 'react-query';
import { makeQueryKey } from '../utils';
import { initialDataAtom } from './intitial-data-atom';
import { IS_SSR, QueryRefreshRates } from '../constants';

export const atomFamilyWithQuery = <Param, Data>(
  key: string,
  queryFn: (get: Getter, param: Param) => Data | Promise<Data>,
  options: {
    equalityFn?: (a: Data, b: Data) => boolean;
    getShouldRefetch?: (initialData: Data) => boolean;
  } & QueryObserverOptions = {}
) => {
  const { equalityFn = deepEqual, getShouldRefetch, refetchInterval, ...rest } = options;
  let shouldRefresh = true;
  return atomFamily<Param, Data>(param => {
    const queryKey = makeQueryKey(key, param);
    const queryAtom = _atomWithQuery(get => {
      const initialData = (get(initialDataAtom(queryKey)) as unknown as Data) || undefined;
      if (getShouldRefetch && initialData) shouldRefresh = getShouldRefetch(initialData);
      return {
        queryKey,
        queryFn: () => queryFn(get, param),
        initialData,
        keepPreviousData: true,
        refetchInterval: shouldRefresh ? refetchInterval || QueryRefreshRates.Default : false,
        ...rest,
      } as any;
    }, equalityFn);
    queryAtom.debugLabel = `atomFamilyWithQuery/queryAtom/${hashQueryKey(queryKey as QueryKey)}`;

    const anAtom = atom(
      get => {
        const initialData = get(initialDataAtom(queryKey));
        if (IS_SSR) {
          return initialData as unknown as Data;
        } else {
          const queryData = get(queryAtom);
          return (queryData || initialData) as Data;
        }
      },
      async get => {
        const queryClient = get(queryClientAtom);
        await queryClient?.refetchQueries({
          queryKey,
        });
      }
    );
    anAtom.debugLabel = `atomFamilyWithQuery/${hashQueryKey(queryKey as QueryKey)}`;
    return anAtom;
  }, deepEqual);
};
