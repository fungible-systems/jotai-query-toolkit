//---------------------
// next.js specific
//---------------------
export {
  getCachedQueryData,
  getDataFromQueryArray,
  getSingleCachedQueryData,
  getInitialPropsFromQueries,
} from './nextjs/index';

export { useQueryInitialValues } from './nextjs/hooks';
export { withInitialQueries } from './nextjs/hoc';
export { IS_SSR } from './constants';
export type {
  QueryPropsGetter,
  GetQueries,
  Queries,
  Fetcher,
  GetQueryKey,
  Query,
} from './nextjs/index';
