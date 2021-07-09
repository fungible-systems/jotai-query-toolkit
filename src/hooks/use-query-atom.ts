import { useCallback, useMemo } from 'react';
import { atom } from 'jotai';
import { useAtomCallback, useAtomValue } from 'jotai/utils';

import { queryKeyCache } from '../utils';
import { getWeakCacheItem } from '../cache';

import type { WritableAtom } from 'jotai';
import type { QueryKey } from 'react-query';
import { queryKeyStatusAtom, QueryStatus } from '../atoms/react-query/query-key-status-atom';
import { JQTAtomWithQueryActions } from '../atoms/atom-with-query';
import { SetDataOptions } from 'react-query/types/core/query';
import { getQueryClientAtom } from 'jotai/query';
import { queryKeyObserver } from '../atoms/react-query/query-key-observer';

const noopAtom = atom<undefined>(undefined);

const conditionalQueryKeyAtom = (queryKey: QueryKey | undefined) => {
  if (!queryKey) return noopAtom;
  return queryKeyStatusAtom(queryKey);
};

export interface BaseExtras<T> extends QueryStatus {
  refetch: () => void;
  setQueryData: ({ data, options }: { data: T; options?: SetDataOptions }) => void;
  // mutate: (options: MutationOptions<T>) => void;
}

export function useQueryAtom<T>(
  anAtom: WritableAtom<T, JQTAtomWithQueryActions<T>>
): [T, BaseExtras<T>] {
  const atom = useMemo(() => anAtom, [anAtom]);
  const value = useAtomValue<T>(atom);
  const deps = [atom] as const;
  const queryKey = getWeakCacheItem<QueryKey>(queryKeyCache, deps);
  if (!queryKey)
    throw Error(
      `[Jotai Query Toolkit] no query key was found for ${
        atom.debugLabel || atom.toString()
      }, is it an atomFamilyWithQuery atom?`
    );

  const statusAtom = useMemo(() => conditionalQueryKeyAtom(queryKey), [queryKey]);
  const _status = useAtomValue(statusAtom);
  const refetch = useAtomCallback(
    useCallback(
      async (get, set) => {
        const observer = get(queryKeyObserver(queryKey));
        await observer.refetch();
      },
      [atom]
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
        const queryClient = get(getQueryClientAtom);
        await queryClient.getQueryCache().find(queryKey)?.setData(payload.data, payload.options);
      },
      [atom]
    )
  );

  // const mutate = useAtomCallback<void, MutationOptions<T>>(
  //   useCallback(
  //     async (get, set, payload) => {
  //       const queryClient = get(getQueryClientAtom);
  //       await queryClient.executeMutation(payload);
  //     },
  //     [atom]
  //   )
  // );

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
