import type { NextPageContext } from 'next';
import type { QueryClient, QueryKey } from 'react-query';
import type { Atom } from 'jotai/core/atom';
import { GetStaticPropsContext } from 'next';

export type QueryPropsDefault = unknown | undefined;

export type Fetcher<Data = any, QueryProps = QueryPropsDefault> = (
  ctx: NextPageContext | GetStaticPropsContext,
  queryProps?: QueryProps,
  queryClient?: QueryClient
) => Promise<Data> | Data;

export type GetQueryKey<QueryProps = QueryPropsDefault> = (
  ctx: NextPageContext | GetStaticPropsContext,
  queryProps?: QueryProps,
  queryClient?: QueryClient
) => QueryKey | Promise<QueryKey | undefined> | undefined;

export type Query<QueryProps = QueryPropsDefault> = [
  queryKey: GetQueryKey<QueryProps> | QueryKey | undefined,
  fetcher: Fetcher<any, QueryProps>
];
export type Queries<QueryProps = QueryPropsDefault> = Readonly<Query<QueryProps>>[];

export type GetQueries<QueryProps = QueryPropsDefault> = (
  ctx: NextPageContext | GetStaticPropsContext,
  queryProps?: QueryProps,
  queryClient?: QueryClient
) => Queries<QueryProps> | Promise<Queries<QueryProps>>;

export type QueryPropsGetter<QueryProps> = (
  context: NextPageContext | GetStaticPropsContext,
  queryClient: QueryClient
) => QueryProps | Promise<QueryProps>;

export interface GetInitialPropsFromQueriesOptions<QueryProps> {
  getQueries: GetQueries<QueryProps> | Queries<QueryProps>;
  ctx: NextPageContext | GetStaticPropsContext;
  getQueryProps?: QueryPropsGetter<QueryProps>;
  queryClient: QueryClient;
}

export type InitialValuesAtomBuilder = [
  propKey: string,
  atomBuilder: (propData: any) => [Atom<unknown>, unknown]
];
