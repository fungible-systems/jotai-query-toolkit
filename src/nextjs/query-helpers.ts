import { hashQueryKey, QueryClient, QueryKey } from 'react-query';

/**
 * this function gets the QueryCache from our react-query queryClient
 * and looks for a query that might already be cached and returns it
 *
 * @param queryKey - {@link QueryKey} the query key we're interested in
 * @param queryClient - {@link QueryClient} the query client to check against
 */
export function getSingleCachedQueryData<Data = unknown>(
  queryKey: QueryKey,
  queryClient: QueryClient
): Data | undefined {
  const cache = queryClient.getQueryCache();
  const queries = cache.getAll();
  const hashedQueryKey = hashQueryKey(queryKey);
  const match = queries.find(query => query.queryHash === hashedQueryKey);
  if (match) return match?.state.data as Data;
  return undefined;
}

/**
 * this function gets the QueryCache from our react-query queryClient
 * and looks for any of the queries passed that might already be cached and returns thems
 *
 * @param queryKeys - {@link QueryKey} the query key we're interested in
 * @param queryClient - {@link QueryClient} the query client to check against
 */
export function getCachedQueryData(queryKeys: QueryKey[], queryClient: QueryClient) {
  const found: Record<string, any> = {};
  queryKeys.forEach(queryKey => {
    const match = getSingleCachedQueryData(queryKey, queryClient);
    if (match) found[hashQueryKey(queryKey)] = match;
  });
  if (Object.keys(found).length) return found;
}

/**
 * Helper function to extract a query key's data from the response of {@link getInitialPropsFromQueries}
 *
 * @param queryKey - {@link QueryKey} the query key we're interested in
 * @param queryArray - An object where each key is a hashed query key and the value is the data associated with it
 */
export function getDataFromQueryArray<Data>(
  queryKey: QueryKey,
  queryArray: Record<string, unknown>
) {
  return queryArray[hashQueryKey(queryKey)] as Data;
}
