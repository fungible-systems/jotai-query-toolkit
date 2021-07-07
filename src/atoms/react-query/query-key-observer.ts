import { atomFamily } from 'jotai/utils';
import { QueryKey, QueryObserver } from 'react-query';
import { atom } from 'jotai';
import { getQueryClientAtom } from 'jotai/query';
import deepEqual from 'fast-deep-equal';

export const queryKeyObserver = atomFamily<QueryKey, QueryObserver>(
  queryKey =>
    atom(get => {
      const queryClient = get(getQueryClientAtom);
      const options = queryClient.getQueryCache().find(queryKey)?.options || { queryKey };
      const defaultedOptions = queryClient.defaultQueryObserverOptions({
        ...options,
        notifyOnChangeProps: ['data', 'error', 'isFetching', 'isIdle', 'isSuccess', 'isStale'],
      });
      return new QueryObserver(queryClient, defaultedOptions);
    }),
  deepEqual
);
