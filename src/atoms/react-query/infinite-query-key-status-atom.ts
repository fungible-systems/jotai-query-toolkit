import { atom } from 'jotai';
import { atomFamily, atomWithDefault } from 'jotai/utils';
import { InfiniteQueryObserverResult, QueryKey } from 'react-query';
import deepEqual from 'fast-deep-equal/es6';
import { infiniteQueryKeyObserver } from './infinite-query-key-observer';

export interface InfiniteQueryStatus {
  isFetchingNextPage: boolean;
  isFetchingPreviousPage: boolean;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}

export const infiniteStatusAtomFamily = atomFamily<
  QueryKey,
  InfiniteQueryStatus,
  InfiniteQueryStatus
>(
  queryKey =>
    atomWithDefault<InfiniteQueryStatus>(get => {
      const observer = get(infiniteQueryKeyObserver(queryKey));
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

export const infiniteQueryKeyStatusAtom = atomFamily<QueryKey, InfiniteQueryStatus>(queryKey => {
  return atom<InfiniteQueryStatus>(get => {
    if (!queryKey) throw Error('infiniteQueryKeyStatusAtom: no query key found');

    const statusAtom = infiniteStatusAtomFamily(queryKey);
    const observer = get(infiniteQueryKeyObserver(queryKey));

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
