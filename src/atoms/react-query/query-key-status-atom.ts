import { atomFamily, atomWithDefault } from 'jotai/utils';
import { QueryKey, QueryObserverResult } from 'react-query';
import { queryKeyObserver } from './query-key-observer';
import deepEqual from 'fast-deep-equal/es6';
import { atom } from 'jotai';

export interface QueryStatus {
  isLoading: boolean;
  isFetching: boolean;
  isIdle: boolean;
  isSuccess: boolean;
  isStale: boolean;
}

export const queryStatusAtomFamily = atomFamily<QueryKey, QueryStatus, QueryStatus>(
  queryKey =>
    atomWithDefault<QueryStatus>(get => {
      const observer = get(queryKeyObserver(queryKey));
      const { isFetching, isLoading, isIdle, isSuccess, isStale } = observer.getCurrentResult();
      return {
        isLoading,
        isFetching,
        isIdle,
        isSuccess,
        isStale,
      };
    }),
  deepEqual
);

export const queryKeyStatusAtom = atomFamily<QueryKey, QueryStatus>(queryKey => {
  return atom<QueryStatus>(get => {
    if (!queryKey) throw Error('queryKeyObserver: no query key found');

    const statusAtom = queryStatusAtomFamily(queryKey);
    const observer = get(queryKeyObserver(queryKey));

    let setData: (data: any) => void = () => {
      throw new Error('queryKeyObserver: setting data without mount');
    };

    const listener = ({ isFetching, isLoading, isIdle, isSuccess, isStale }: QueryObserverResult) =>
      setData({
        isLoading,
        isFetching,
        isIdle,
        isSuccess,
        isStale,
      });

    statusAtom.onMount = update => {
      setData = update;
      const unsubscribe = observer.subscribe(listener);
      return unsubscribe;
    };

    return get(statusAtom);
  });
}, deepEqual);
