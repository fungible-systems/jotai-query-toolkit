import { atom, Getter, Setter } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { getQueryClientAtom } from 'jotai/query';
import {
  InfiniteQueryObserver,
  InfiniteQueryObserverResult,
  QueryKey,
  QueryObserver,
  QueryObserverResult,
} from 'react-query';
import deepEqual from 'fast-deep-equal';
import { InfiniteQueryObserverOptions } from 'react-query/types/core/types';

interface QueryStatus {
  isSuccess?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  isIdle?: boolean;
  isFetched?: boolean;
  isLoadingError?: boolean;
  isLoading?: boolean;
  isPreviousData?: boolean;
}

export interface InfiniteQueryStatus extends QueryStatus {
  isFetchingNextPage: boolean;
  isFetchingPreviousPage: boolean;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}

export const infiniteQueryKeyStatusAtom = atomFamily<QueryKey, InfiniteQueryStatus>(queryKey => {
  if (!queryKey) throw Error('No queryKey passed');

  const statusAtom = atom<InfiniteQueryStatus>({
    isFetchingNextPage: false,
    isFetchingPreviousPage: false,
  });

  let unsubscribe: () => void | undefined;

  let observer: InfiniteQueryObserver | undefined;

  const listener = (get: Getter, set: Setter) => (args: InfiniteQueryObserverResult) => {
    const {
      isSuccess,
      isFetching,
      isError,
      isIdle,
      isFetched,
      isLoadingError,
      isLoading,
      isPreviousData,
      isFetchingNextPage,
      isFetchingPreviousPage,
      hasPreviousPage,
      hasNextPage,
    } = args;
    set(statusAtom, s => ({
      isSuccess,
      isFetching,
      isError,
      isIdle,
      isFetched,
      isLoadingError,
      isLoading,
      isPreviousData,
      isFetchingNextPage,
      isFetchingPreviousPage,
      hasPreviousPage,
      hasNextPage,
    }));
  };

  const baseAtom = atom<InfiniteQueryStatus, { type: 'mount' }>(
    get => get(statusAtom),
    (get, set, action) => {
      if (action.type === 'mount') {
        const queryClient = get(getQueryClientAtom);
        const existingOptions = queryClient.getQueryCache().find(queryKey)?.options || { queryKey };
        const defaultedOptions =
          get(getQueryClientAtom).defaultQueryObserverOptions(existingOptions);
        if (!observer)
          observer = new InfiniteQueryObserver(
            get(getQueryClientAtom),
            defaultedOptions as InfiniteQueryObserverOptions
          );
        unsubscribe = observer.subscribe(listener(get, set));
      }
    }
  );

  baseAtom.onMount = setAtom => {
    setAtom({ type: 'mount' });

    return () => {
      unsubscribe?.();
    };
  };

  return baseAtom;
}, deepEqual);

export const queryKeyStatusAtom = atomFamily<QueryKey, QueryStatus>(queryKey => {
  if (!queryKey) throw Error('No queryKey passed');

  const statusAtom = atom<QueryStatus>({});

  let unsubscribe: () => void | undefined;

  let observer: QueryObserver | undefined;

  const listener = (get: Getter, set: Setter) => (args: QueryObserverResult) => {
    const {
      isSuccess,
      isFetching,
      isError,
      isIdle,
      isFetched,
      isLoadingError,
      isLoading,
      isPreviousData,
    } = args;
    set(statusAtom, s => ({
      isSuccess,
      isFetching,
      isError,
      isIdle,
      isFetched,
      isLoadingError,
      isLoading,
      isPreviousData,
    }));
  };

  const baseAtom = atom<QueryStatus, { type: 'mount' }>(
    get => get(statusAtom),
    (get, set, action) => {
      if (action.type === 'mount') {
        const queryClient = get(getQueryClientAtom);
        const existingOptions = queryClient.getQueryCache().find(queryKey)?.options || { queryKey };
        const defaultedOptions =
          get(getQueryClientAtom).defaultQueryObserverOptions(existingOptions);
        if (!observer) observer = new QueryObserver(get(getQueryClientAtom), defaultedOptions);
        unsubscribe = observer.subscribe(listener(get, set));
      }
    }
  );

  baseAtom.onMount = setAtom => {
    setAtom({ type: 'mount' });

    return () => {
      unsubscribe?.();
    };
  };

  return baseAtom;
}, deepEqual);
