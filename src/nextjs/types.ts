import type { GetServerSidePropsContext, NextPageContext } from 'next';
import type { QueryClient, QueryKey } from 'react-query';
import type { Atom } from 'jotai/core/atom';
import { GetStaticPropsContext } from 'next';

export type QueryPropsDefault = unknown | undefined;

export type Fetcher<Data = unknown, QueryProps = QueryPropsDefault> = (
  ctx: NextPageContext | GetServerSidePropsContext | GetStaticPropsContext,
  queryProps?: QueryProps,
  queryClient?: QueryClient
) => Promise<Data> | Data;

export type GetQueryKey<QueryProps = QueryPropsDefault> = (
  ctx: NextPageContext | GetServerSidePropsContext | GetStaticPropsContext,
  queryProps?: QueryProps,
  queryClient?: QueryClient
) => QueryKey | Promise<QueryKey | undefined> | undefined;

export type Query<Data = unknown, QueryProps = QueryPropsDefault> = [
  queryKey: GetQueryKey<QueryProps> | QueryKey | undefined,
  fetcher: Fetcher<Data, QueryProps>
];
export type Queries<QueryProps = QueryPropsDefault> = Readonly<Query<QueryProps>>[];

export type GetQueries<QueryProps = QueryPropsDefault> = (
  ctx: NextPageContext | GetServerSidePropsContext | GetStaticPropsContext,
  queryProps?: QueryProps,
  queryClient?: QueryClient
) => Queries<QueryProps> | Promise<Queries<QueryProps>> | null;

export type QueryPropsGetter<QueryProps> = (
  context: NextPageContext | GetServerSidePropsContext | GetStaticPropsContext,
  queryClient: QueryClient
) => QueryProps | Promise<QueryProps>;

export interface GetInitialPropsFromQueriesOptions<QueryProps> {
  getQueries: GetQueries<QueryProps> | Queries<QueryProps>;
  ctx: NextPageContext | GetServerSidePropsContext | GetStaticPropsContext;
  getQueryProps?: QueryPropsGetter<QueryProps>;
  queryClient: QueryClient;
}

export type InitialValuesAtomBuilder<Key = string> = [
  propKey: Key,
  atomBuilder: (propData: unknown) => readonly [Atom<unknown>, unknown]
];
