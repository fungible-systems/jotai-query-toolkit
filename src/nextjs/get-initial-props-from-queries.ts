import { hashQueryKey, QueryKey } from 'react-query';
import {
  Fetcher,
  GetInitialPropsFromQueriesOptions,
  GetQueryKey,
  QueryPropsDefault,
} from './types';
import { getCachedQueryData } from './query-helpers';

/**
 * getInitialPropsFromQueries
 *
 * This is the main function that gives us a great developer and user experience when it comes to
 * fetching data on the server and making use of it on the client via atom state.
 *
 * This method will either find an existing bit of data/state cached via react-query
 * or it will fetch the data via the async fetcher provided to it.
 *
 * This is important because we only want to fetch our data in `getInitialProps` if there is no cached data.
 *
 *```typescript
 * SomeNextPage.getInitialProps = async (context: NextPageContext) => {
 *   const queries = [[SomeEnum.SomeKey, async () => fetchData()]];
 *   const pageProps = await getInitialPropsFromQueries(queries);
 *
 *   return pageProps
 * }
 * ```
 * @param options - {@link GetInitialPropsFromQueriesOptions} the object of options for this method
 * @return Returns an object of the hashed query keys and data result from the fetcher associated with it, to be consumed by {@see useQueryInitialValues}
 */
export async function getInitialPropsFromQueries<QueryProps = QueryPropsDefault>(
  options: GetInitialPropsFromQueriesOptions<QueryProps>
) {
  try {
    const { getQueries, ctx, getQueryProps, queryClient } = options;

    const queryProps: QueryProps | undefined = getQueryProps
      ? await getQueryProps(ctx, queryClient)
      : undefined;

    const getQueryKey = (queryKey: GetQueryKey<QueryProps> | QueryKey) => {
      if (typeof queryKey === 'function') return queryKey(ctx, queryProps, queryClient);
      return queryKey;
    };

    const _queries =
      typeof getQueries === 'function'
        ? await getQueries(ctx, queryProps, queryClient)
        : getQueries;

    if (!_queries) return {};

    const queries = (
      await Promise.all(
        _queries
          .filter(([queryKey]) => !!queryKey)
          .map(async ([queryKey, fetcher]) => [await getQueryKey(queryKey!), fetcher])
      )
    ).filter(([queryKey]) => queryKey) as [QueryKey, Fetcher<QueryProps>][];
    // let's extract only the query keys
    const queryKeys = queries.map(([queryKey]) => queryKey);

    if (queryKeys.length === 0) return {};

    // see if we have any cached in the query client
    const data = getCachedQueryData(queryKeys, queryClient) || {};
    const dataKeys = Object.keys(data);
    const allArgsAreCached = dataKeys.length === queries.length;
    // everything is cached, let's return it now
    if (allArgsAreCached) return data;
    // some or none of the args weren't available, as such we need to fetch them
    const results = await Promise.all(
      queries
        // filter the items away that are already cached
        .filter(([queryKey]) => {
          const valueExists = !!data[hashQueryKey(queryKey)];
          return !valueExists;
        })
        // map through and fetch the data for each
        .map(async ([queryKey, fetcher]) => {
          const value = await fetcher(ctx, queryProps, queryClient);
          return [queryKey, value] as [QueryKey, typeof value];
        })
    );

    results.forEach(([queryKey, result]) => {
      // add them to the data object
      data[hashQueryKey(queryKey)] = result;
    });
    // and return them!
    return data;
  } catch (e: any) {
    return {
      error: true,
      message: e.message,
    };
  }
}
