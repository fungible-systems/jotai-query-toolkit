import { hashQueryKey, QueryClient, QueryKey } from 'react-query';
import type { NextPageContext } from 'next';

type QueryPropsDefault = unknown | undefined;
export type Fetcher<Data = any, QueryProps = QueryPropsDefault> = (
  ctx: NextPageContext,
  queryProps?: QueryProps
) => Promise<Data> | Data;
export type GetQueryKey<QueryProps = QueryPropsDefault> = (
  ctx: NextPageContext,
  queryProps?: QueryProps
) => QueryKey | Promise<QueryKey | undefined> | undefined;
export type Query<QueryProps = QueryPropsDefault> = [
  queryKey: GetQueryKey<QueryProps> | QueryKey | undefined,
  fetcher: Fetcher<any, QueryProps>
];

export type Queries<QueryProps = QueryPropsDefault> = Readonly<Query<QueryProps>>[];
export type GetQueries<QueryProps = QueryPropsDefault> = (
  ctx: NextPageContext,
  queryProps?: QueryProps
) => Queries<QueryProps> | Promise<Queries<QueryProps>>;

export type QueryPropsGetter<QueryProps> = (
  context: NextPageContext,
  queryClient: QueryClient
) => QueryProps | Promise<QueryProps>;

interface GetInitialPropsFromQueriesOptions<QueryProps> {
  getQueries: GetQueries<QueryProps> | Queries<QueryProps>;
  ctx: NextPageContext;
  getQueryProps?: QueryPropsGetter<QueryProps>;
  queryClient: QueryClient;
}

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
 * @param options - {@link GetInitialPropsFromQueriesOptions} the object of options for this method
 * @return Returns an object of the hashed query keys and data result from the fetcher associated with it, to be consumed by {@see useQueryInitialValues}
 */
export async function getInitialPropsFromQueries<QueryProps = QueryPropsDefault>(
  options: GetInitialPropsFromQueriesOptions<QueryProps>
) {
  const { getQueries, ctx, getQueryProps, queryClient } = options;

  const queryProps: QueryProps | undefined = getQueryProps
    ? await getQueryProps(ctx, queryClient)
    : undefined;

  const getQueryKey = (queryKey: GetQueryKey<QueryProps> | QueryKey) => {
    if (typeof queryKey === 'function') return queryKey(ctx, queryProps);
    return queryKey;
  };

  const _queries =
    typeof getQueries === 'function' ? await getQueries(ctx, queryProps) : getQueries;
  const queries = (
    await Promise.all(
      _queries
        .filter(([queryKey]) => queryKey)
        .map(async ([queryKey, fetcher]) => [await getQueryKey(queryKey!), fetcher])
    )
  ).filter(([queryKey]) => queryKey) as [QueryKey, Fetcher<QueryProps>][];
  // let's extract only the query keys
  const queryKeys = queries.map(([queryKey]) => queryKey);
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
        const value = await fetcher(ctx, queryProps);
        return [queryKey, value] as [QueryKey, typeof value];
      })
  );

  results.forEach(([queryKey, result]) => {
    // add them to the data object
    data[hashQueryKey(queryKey)] = result;
  });
  // and return them!
  return data;
}

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
