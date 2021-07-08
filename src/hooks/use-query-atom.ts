import { useCallback, useMemo } from 'react';
import { atom } from 'jotai';
import { useAtomCallback, useAtomValue } from 'jotai/utils';

import { queryKeyCache } from '../utils';
import { getWeakCacheItem } from '../cache';

import type { WritableAtom } from 'jotai';
import type { QueryKey } from 'react-query';
import type { AtomWithQueryAction } from 'jotai/query';
import { queryKeyStatusAtom, QueryStatus } from '../atoms/react-query/query-key-status-atom';
import { queryKeyObserver } from '../atoms/react-query/query-key-observer';

const noopAtom = atom<undefined>(undefined);

const conditionalQueryKeyAtom = (queryKey: QueryKey | undefined) => {
  if (!queryKey) return noopAtom;
  return queryKeyStatusAtom(queryKey);
};

export interface BaseExtras extends QueryStatus {
  refetch: () => void;
}

export function useQueryAtom<T>(anAtom: WritableAtom<T, AtomWithQueryAction>): [T, BaseExtras] {
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

  const status = _status || {};
  return [
    value,
    {
      refetch,
      ...(status as QueryStatus),
    },
  ];
}
