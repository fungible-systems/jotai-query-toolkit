//---------------------
// next.js specific
//---------------------
export { withInitialQueries } from './nextjs/with-initial-queries';
export { IS_SSR } from './constants';
export { getInitialPropsFromQueries } from './nextjs/get-initial-props-from-queries';
export { getDataFromQueryArray } from './nextjs/query-helpers';
export { getCachedQueryData } from './nextjs/query-helpers';
export { getSingleCachedQueryData } from './nextjs/query-helpers';
export { useQueryInitialValues } from './nextjs/use-query-initial-values';
export { buildInitialValueAtoms } from './nextjs/build-initial-value-atoms';
export { JqtDevtools } from './devtools';
export type {
  QueryPropsGetter,
  GetQueries,
  Queries,
  Query,
  GetQueryKey,
  Fetcher,
  InitialValuesAtomBuilder,
  GetInitialPropsFromQueriesOptions,
  QueryPropsDefault,
} from './nextjs/types';
