import { hashQueryKey, QueryKey } from 'react-query';
import { queryClient } from '../query-client';

export type Queries<Data> = [queryKey: QueryKey, fetcher: () => Promise<Data>];

/**
 * Get initial queries
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
 * @param queries - {@link Queries} An array of QueryKey's and fetchers for the query.
 * @return Returns an object of the hashed query keys and data result from the fetcher associated with it, to be consumed by {@see useQueryInitialValues}
 */

export async function getInitialPropsFromQueries<Data>(
  queries: Readonly<Queries<Data>[]>
): Promise<Record<string, Data>> {
  // let's extract only the query keys
  const queryKeys = queries.map(([queryKey]) => queryKey);
  // see if we have any cached in the query client
  const data: Record<string, unknown> = getCachedQueryData(queryKeys) || {};
  const dataKeys = Object.keys(data);
  const hasCachedData = dataKeys.length > 0;
  const allArgsAreCached = dataKeys.length === queries.length;
  // everything is cached, let's return it now
  if (allArgsAreCached) return data as Record<string, Data>;

  // some or none of the args weren't available, as such we need to fetch them
  const results = await Promise.all(
    queries
      // filter the items away that are already cached
      .filter(([queryKey]) => (hasCachedData ? !!data[hashQueryKey(queryKey)] : true))
      // map through and fetch the data for each
      .map(async ([queryKey, fetcher]) => {
        return [queryKey, await fetcher()] as [QueryKey, Data];
      })
  );

  results.forEach(([queryKey, result]) => {
    // add them to the data object
    data[hashQueryKey(queryKey)] = result;
  });
  // and return them!
  return data as Record<string, Data>;
}

// this function gets the cache from our react-query queryClient
// and looks for any queries that might already be cached and returns them
export function getCachedQueryData(queryKeys: QueryKey[]) {
  const found: Record<string, any> = {};
  const cache = queryClient.getQueryCache();
  const queries = cache.getAll();

  queryKeys.forEach(queryKey => {
    const match = queries.find(query => query.queryHash === hashQueryKey(queryKey));
    if (match) found[hashQueryKey(queryKey)] = match.state.data;
  });
  if (Object.keys(found).length) return found;
}

// helper method to extract data from the fetchInitialQueries method
export function getDataFromQueryArray<Data>(
  queryKey: QueryKey,
  queryArray: Record<string, unknown>
) {
  return queryArray[hashQueryKey(queryKey)] as Data;
}
