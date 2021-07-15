import { atomFamily } from 'jotai/utils';
import { InfiniteQueryObserver, InfiniteQueryObserverOptions, QueryKey } from 'react-query';
import { atom } from 'jotai';
import { getQueryClientAtom } from './query-client-atom';
import deepEqual from 'fast-deep-equal/es6';

export const infiniteQueryKeyObserver = atomFamily<QueryKey, InfiniteQueryObserver>(
  queryKey =>
    atom(get => {
      const queryClient = getQueryClientAtom(get);
      const options = queryClient.getQueryCache().find(queryKey)?.options || {
        queryKey,
      };
      const defaultedOptions = queryClient.defaultQueryObserverOptions({
        ...options,
        notifyOnChangeProps: [
          'isFetchingPreviousPage',
          'isFetchingNextPage',
          'hasNextPage',
          'hasPreviousPage',
        ],
      });
      const observer = new InfiniteQueryObserver(
        queryClient,
        defaultedOptions as InfiniteQueryObserverOptions
      );
      return observer;
    }),
  deepEqual
);
