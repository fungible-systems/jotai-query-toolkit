import { atomFamily } from 'jotai/utils';
import { QueryKey, QueryObserver } from 'react-query';
import { atom } from 'jotai';
import { getQueryClientAtom } from './query-client-atom';
import deepEqual from 'fast-deep-equal/es6';

export const queryKeyObserver = atomFamily<QueryKey | undefined, QueryObserver | undefined>(
  queryKey =>
    atom(get => {
      if (!queryKey) return;
      const queryClient = getQueryClientAtom(get);
      const options = queryClient.getQueryCache().find(queryKey)?.options || { queryKey };
      const defaultedOptions = queryClient.defaultQueryObserverOptions({
        ...options,
        notifyOnChangeProps: ['isFetching', 'isIdle', 'isSuccess', 'isStale'],
      });
      return new QueryObserver(queryClient, defaultedOptions);
    }),
  deepEqual
);
