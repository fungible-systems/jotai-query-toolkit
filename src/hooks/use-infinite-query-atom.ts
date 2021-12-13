import { useCallbackOne, useMemoOne } from 'use-memo-one';
import { atom } from 'jotai';
import { useAtomCallback, useAtomValue } from 'jotai/utils';

import { infiniteQueryKeyStatusAtom } from '../atoms/react-query/infinite-query-key-status-atom';
import { makeMessage, queryKeyCache } from '../utils';
import { getCacheItem } from '../cache';

import type { WritableAtom } from 'jotai';
import type { InfiniteQueryStatus } from '../atoms/react-query/infinite-query-key-status-atom';
import type { InfiniteData, QueryKey } from 'react-query';
import type { AtomWithInfiniteQueryAction } from 'jotai/query';
import { Atom } from 'jotai/core/atom';

const noopAtom = atom<undefined>(undefined);

const conditionalQueryKeyAtom = (queryKey: QueryKey | undefined) => {
  if (!queryKey) return noopAtom;
  return infiniteQueryKeyStatusAtom(queryKey);
};

export interface UseInfiniteQueryAtomBaseExtras {
  fetchNextPage: () => void;
  fetchPreviousPage: () => void;
  refetch: () => void;
}

export interface OptionalStatus extends UseInfiniteQueryAtomBaseExtras {
  isFetchingPreviousPage: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function useInfiniteQueryAtom<T>(
  anAtom: WritableAtom<InfiniteData<T> | undefined, AtomWithInfiniteQueryAction<T>>
): [InfiniteData<T> | undefined, OptionalStatus] {
  const memoizedAtom = useMemoOne(() => anAtom, [anAtom]);
  const value = useAtomValue<InfiniteData<T> | undefined>(memoizedAtom);
  const queryKey = getCacheItem<QueryKey>(queryKeyCache, memoizedAtom);

  const withQueryKeyWarning = useCallbackOne(() => {
    if (!queryKey)
      console.warn(
        makeMessage(
          `no query key was found for ${memoizedAtom.debugLabel || memoizedAtom.toString()}`
        )
      );
  }, [queryKey, memoizedAtom]);

  const statusAtom = useMemoOne<Atom<unknown>>(() => conditionalQueryKeyAtom(queryKey), [queryKey]);
  const status = useAtomValue(statusAtom);

  const fetchNextPage = useAtomCallback(
    useCallbackOne(
      (get, set) => {
        withQueryKeyWarning();
        set(memoizedAtom, { type: 'fetchNextPage' });
      },
      [memoizedAtom]
    )
  );
  const fetchPreviousPage = useAtomCallback(
    useCallbackOne(
      (get, set) => {
        withQueryKeyWarning();
        set(memoizedAtom, { type: 'fetchPreviousPage' });
      },
      [memoizedAtom]
    )
  );
  const refetch = useAtomCallback(
    useCallbackOne(
      (get, set) => {
        withQueryKeyWarning();
        set(memoizedAtom, { type: 'refetch' });
      },
      [memoizedAtom]
    )
  );

  const optionalStatus = {
    isFetchingPreviousPage: (status as InfiniteQueryStatus)?.isFetchingPreviousPage || false,
    isFetchingNextPage: (status as InfiniteQueryStatus)?.isFetchingNextPage || false,
    hasNextPage: !!(status as InfiniteQueryStatus)?.hasNextPage || false,
    hasPreviousPage: !!(status as InfiniteQueryStatus)?.hasPreviousPage || false,
  };

  return [
    value,
    {
      fetchNextPage,
      fetchPreviousPage,
      refetch,
      ...optionalStatus,
    },
  ];
}
