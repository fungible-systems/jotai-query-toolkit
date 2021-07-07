//---------------------
// atoms
//---------------------
export { atomFamilyWithQuery } from './atoms/atom-family-with-query';
export { atomFamilyWithInfiniteQuery } from './atoms/atom-family-with-infinite-query';
export { atomWithQuery } from './atoms/atom-with-query-refresh';
export { atomWithInfiniteQuery } from './atoms/atom-with-infinite-query';
export { initialDataAtom } from './atoms/intitial-data-atom';
export { infiniteQueryKeyStatusAtom } from './atoms/react-query/infinite-query-key-status-atom';
export type { InfiniteQueryStatus } from './atoms/react-query/infinite-query-key-status-atom';
export { queryKeyStatusAtom } from './atoms/react-query/query-key-status-atom';
export type { QueryStatus } from './atoms/react-query/query-key-status-atom';
export { queryKeyObserver } from './atoms/react-query/query-key-observer';
export { infiniteQueryKeyObserver } from './atoms/react-query/infinite-query-key-observer';
export { devtoolAtom } from './atoms/devtool-atom';
// utils
export { makeAtomWithQuery } from './atoms/utils/make-atom-with-query';
export { makeAtomFamilyWithQuery } from './atoms/utils/make-atom-family-with-query';
export { makeAtomFamilyWithInfiniteQuery } from './atoms/utils/make-atom-family-with-infinite-query';

//hooks
export { useInfiniteQueryAtom } from './hooks/use-infinite-query-atom';
export { useQueryAtom } from './hooks/use-query-atom';

// types
export type {
  AtomFamilyWithQueryFn,
  AtomWithQueryRefreshOptions,
  AtomWithInfiniteQueryOptions,
  InfiniteQueryDispatch,
  AtomWithQueryFn,
  AtomWithInfiniteQueryFn,
  ParamWithListParams,
  ListParams,
} from './atoms/types';

//---------------------
// utils + misc
//---------------------
export { queryClient } from './query-client';
export { makeQueryKey, queryKeyCache } from './utils';
export { QueryRefreshRates } from './constants';
export { setScope, SCOPE_CACHE_KEY, cache, getScope } from './atoms/utils/set-global-scope';
