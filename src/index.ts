//---------------------
// atoms
//---------------------
export { atomFamilyWithQuery } from './atoms/atom-family-with-query';
export { atomFamilyWithInfiniteQuery } from './atoms/atom-family-with-infinite-query';
export { atomWithQuery } from './atoms/atom-with-query';
export { atomWithInfiniteQuery } from './atoms/atom-with-infinite-query';
export * from './atoms/react-query/query-client-atom';
export { initialDataAtom } from './atoms/intitial-data-atom';
export { infiniteQueryKeyStatusAtom } from './atoms/react-query/infinite-query-key-status-atom';
export { queryKeyStatusAtom } from './atoms/react-query/query-key-status-atom';
export { queryKeyObserver } from './atoms/react-query/query-key-observer';
export { infiniteQueryKeyObserver } from './atoms/react-query/infinite-query-key-observer';
export { devtoolAtom } from './atoms/devtool-atom';

//hooks
export { useInfiniteQueryAtom } from './hooks/use-infinite-query-atom';
export { useQueryAtom } from './hooks/use-query-atom';
export type {
  UseInfiniteQueryAtomBaseExtras,
  OptionalStatus,
} from './hooks/use-infinite-query-atom';
export type { UseQueryAtomBaseExtras } from './hooks/use-query-atom';

// types
export type {
  AtomFamilyWithQueryFn,
  AtomWithQueryOptions,
  AtomWithInfiniteQueryOptions,
  InfiniteQueryDispatch,
  AtomWithQueryFn,
  AtomWithInfiniteQueryFn,
  ParamWithListParams,
  ListParams,
} from './atoms/types';
export type { InfiniteQueryStatus } from './atoms/react-query/infinite-query-key-status-atom';
export type { QueryStatus } from './atoms/react-query/query-key-status-atom';
//---------------------
// utils + misc
//---------------------
export { queryClient } from './query-client';
export { makeQueryKey, queryKeyCache } from './utils';
export { QueryRefreshRates, IS_SSR } from './constants';
