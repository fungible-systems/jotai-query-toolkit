//---------------------
// next.js specific
//---------------------
export {
  getCachedQueryData,
  getDataFromQueryArray,
  getInitialPropsFromQueries,
} from './nextjs/index';
export { withInitialQueries } from './nextjs/hoc';
export { QueryProvider } from './nextjs/query-provider';
export { IS_SSR } from './constants';
export type { Queries } from './nextjs/index';
