import { QueryObserverOptions } from 'react-query';
import { Getter } from 'jotai';

export interface AtomWithQueryRefreshOptions<Data> extends QueryObserverOptions<Data, void, Data> {
  equalityFn?: (a: Data, b: Data) => boolean;
  getShouldRefetch?: (initialData: Data) => boolean;
}

export type AtomWithQueryRefreshQueryFn<Data> = (get: Getter) => Data | Promise<Data>;

export interface InfiniteQueryOptions<Data> {
  limit: number;
  getNextOffset: (data: Data, allPages: Data[]) => number | false;
}

export type AtomFamilyWithInfiniteQuery<Data> = AtomWithQueryRefreshOptions<Data> &
  InfiniteQueryOptions<Data>;

export type InfiniteQueryDispatch =
  | { type: 'mount' }
  | { type: 'next' }
  | { type: 'prev' }
  | { type: 'refresh' };

export interface ListParams {
  limit: number;
  offset: number;
}

export type ParamWithListParams<T> = [param: T, options: ListParams];

export type AtomFamilyWithQueryFn<Param, Data> = (
  get: Getter,
  param: Param
) => Data | Promise<Data>;
