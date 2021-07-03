import { atom } from 'jotai';
import { atomFamily, atomWithDefault } from 'jotai/utils';
import { getQueryClientAtom } from 'jotai/query';
import {
  InfiniteQueryObserver,
  InfiniteQueryObserverResult,
  InfiniteQueryObserverOptions,
  QueryKey,
} from 'react-query';
import deepEqual from 'fast-deep-equal';

export interface InfiniteQueryStatus {
  isFetchingNextPage: boolean;
  isFetchingPreviousPage: boolean;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}

const statusAtomFamily = atomFamily<QueryKey, InfiniteQueryStatus, InfiniteQueryStatus>(
  queryKey =>
    atomWithDefault<InfiniteQueryStatus>(get => {
      const observer = get(queryKeyObserver(queryKey));
      const { isFetchingPreviousPage, isFetchingNextPage, hasNextPage, hasPreviousPage } =
        observer.getCurrentResult();
      return {
        isFetchingPreviousPage,
        isFetchingNextPage,
        hasNextPage,
        hasPreviousPage,
      };
    }),
  deepEqual
);

const queryKeyObserver = atomFamily<QueryKey, InfiniteQueryObserver>(
  queryKey =>
    atom(get => {
      const queryClient = get(getQueryClientAtom);
      const existing = queryClient.getQueryCache().find(queryKey);

      const existingOptions = existing?.options || {
        queryKey,
      };
      const defaultedOptions = queryClient.defaultQueryObserverOptions(existingOptions);
      const observer = new InfiniteQueryObserver(
        queryClient,
        defaultedOptions as InfiniteQueryObserverOptions
      );
      return observer;
    }),
  deepEqual
);

export const infiniteQueryKeyStatusAtom = atomFamily<QueryKey, InfiniteQueryStatus>(queryKey => {
  return atom<InfiniteQueryStatus>(get => {
    if (!queryKey) throw Error('infiniteQueryKeyStatusAtom: no query key found');

    const statusAtom = statusAtomFamily(queryKey);
    const observer = get(queryKeyObserver(queryKey));

    let setData: (data: any) => void = () => {
      throw new Error('infiniteQueryKeyStatusAtom: setting data without mount');
    };

    const listener = ({
      isFetchingPreviousPage,
      isFetchingNextPage,
      hasNextPage,
      hasPreviousPage,
    }: InfiniteQueryObserverResult) =>
      setData({
        isFetchingPreviousPage,
        isFetchingNextPage,
        hasNextPage,
        hasPreviousPage,
      });

    statusAtom.onMount = update => {
      setData = update;
      const unsubscribe = observer.subscribe(listener);
      return unsubscribe;
    };

    return get(statusAtom);
  });
}, deepEqual);
