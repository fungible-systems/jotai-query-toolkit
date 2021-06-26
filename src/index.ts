//---------------------
// atoms
//---------------------
export { atomFamilyWithQuery } from './atoms/atom-family-with-query';
export { atomWithQueryRefresh } from './atoms/atom-with-query-refresh';
export { initialDataAtom } from './atoms/intitial-data-atom';

//---------------------
// utils + misc
//---------------------
export { queryClient } from './query-client';
export { makeQueryKey } from './utils';
export { IS_SSR, QueryRefreshRates } from './constants';

//---------------------
// next.js specific
//---------------------
export {
  getCachedQueryData,
  getDataFromQueryArray,
  getInitialPropsFromQueries,
} from './next-js/index';
export { withInitialQueries } from './next-js/hoc';
export { QueryProvider } from './next-js/query-provider';
export type { Queries } from './next-js/index';
