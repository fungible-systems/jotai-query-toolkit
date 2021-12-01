import { useCallback, useMemo } from 'react';
import { atom } from 'jotai';
import { useAtomCallback, useAtomValue } from 'jotai/utils';

import { makeMessage, queryKeyCache } from '../utils';
import { getWeakCacheItem } from '../cache';

import type { WritableAtom } from 'jotai';
import type { QueryKey, SetDataOptions } from 'react-query';
import { queryKeyStatusAtom, QueryStatus } from '../atoms/react-query/query-key-status-atom';
import { JQTAtomWithQueryActions } from '../atoms/atom-with-query';
import { queryKeyObserver } from '../atoms/react-query/query-key-observer';
import { getQueryClientAtom } from '../atoms/react-query/query-client-atom';
import { IS_DEV } from '../constants';

const noopAtom = atom<undefined>(undefined);

const conditionalQueryKeyAtom = (queryKey: QueryKey | undefined) => {
  if (!queryKey) return noopAtom;
  return queryKeyStatusAtom(queryKey);
};

export interface UseQueryAtomBaseExtras<T> extends QueryStatus {
  refetch: () => void;
  setQueryData: ({ data, options }: { data: T; options?: SetDataOptions }) => void;
}

function makeErrorLog(anAtom?: any) {
  if (IS_DEV)
    console.error(
      makeMessage(
        `no query key was found for ${
          anAtom.debugLabel || anAtom.toString() || 'UnknownAtom'
        }, is it an atomFamilyWithQuery atom?`
      )
    );
}

export function useQueryAtom<T>(
  anAtom: WritableAtom<T, JQTAtomWithQueryActions<T>>
): [T extends Promise<infer V> ? V : T, UseQueryAtomBaseExtras<T>] {
  const atom = useMemo(() => anAtom, [anAtom]);
  const value = useAtomValue<T>(atom);
  const deps = [atom] as const;
  const queryKey = getWeakCacheItem<QueryKey>(queryKeyCache, deps);
  if (!queryKey) makeErrorLog(anAtom);

  const statusAtom = useMemo(() => conditionalQueryKeyAtom(queryKey), [queryKey]);
  const _status = useAtomValue(statusAtom);
  const refetch = useAtomCallback(
    useCallback(
      async get => {
        if (!queryKey) {
          makeErrorLog(anAtom);
          return;
        }
        const observer = get(queryKeyObserver(queryKey));
        await observer?.refetch();
      },
      [anAtom, queryKey]
    )
  );

  const setQueryData = useAtomCallback<
    void,
    {
      data: T;
      options?: SetDataOptions;
    }
  >(
    useCallback(
      async (get, set, payload) => {
        if (!queryKey) {
          makeErrorLog(anAtom);
          return;
        }
        const queryClient = getQueryClientAtom(get);
        await queryClient.getQueryCache().find(queryKey)?.setData(payload.data, payload.options);
      },
      [anAtom, queryKey]
    )
  );

  const status = _status || {};
  return [
    value,
    {
      refetch,
      setQueryData,
      ...(status as QueryStatus),
    },
  ];
}
