import { NextPageContext } from 'next';
import { QueryClient, QueryKey } from 'react-query';

export type QueryPropsDefault = unknown | undefined;
export type Fetcher<Data = any, QueryProps = QueryPropsDefault> = (
  ctx: NextPageContext,
  queryProps?: QueryProps,
  queryClient?: QueryClient
) => Promise<Data> | Data;
export type GetQueryKey<QueryProps = QueryPropsDefault> = (
  ctx: NextPageContext,
  queryProps?: QueryProps,
  queryClient?: QueryClient
) => QueryKey | Promise<QueryKey | undefined> | undefined;
export type Query<QueryProps = QueryPropsDefault> = [
  queryKey: GetQueryKey<QueryProps> | QueryKey | undefined,
  fetcher: Fetcher<any, QueryProps>
];
export type Queries<QueryProps = QueryPropsDefault> = Readonly<Query<QueryProps>>[];
export type GetQueries<QueryProps = QueryPropsDefault> = (
  ctx: NextPageContext,
  queryProps?: QueryProps,
  queryClient?: QueryClient
) => Queries<QueryProps> | Promise<Queries<QueryProps>>;
export type QueryPropsGetter<QueryProps> = (
  context: NextPageContext,
  queryClient: QueryClient
) => QueryProps | Promise<QueryProps>;

export interface GetInitialPropsFromQueriesOptions<QueryProps> {
  getQueries: GetQueries<QueryProps> | Queries<QueryProps>;
  ctx: NextPageContext;
  getQueryProps?: QueryPropsGetter<QueryProps>;
  queryClient: QueryClient;
}
