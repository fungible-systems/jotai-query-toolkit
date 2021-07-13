import {
  InfiniteData,
  InfiniteQueryObserverOptions,
  QueryFunctionContext,
  QueryKey,
  QueryObserverOptions,
} from 'react-query';
import { Atom, Getter, PrimitiveAtom } from 'jotai';

export interface BaseQueryAtomCustomOptions<Data> {
  equalityFn?: (a: Data, b: Data) => boolean;
  queryKeyAtom?: Atom<QueryKey> | PrimitiveAtom<QueryKey>;
  getShouldRefetch?: (initialData: Data) => boolean;
}

export type AtomWithQueryOptions<Data> = QueryObserverOptions<Data, void, Data> &
  BaseQueryAtomCustomOptions<Data>;

export interface AtomWithInfiniteQueryOptions<Data>
  extends InfiniteQueryObserverOptions<Data, unknown, Data, Data> {
  equalityFn?: (a: InfiniteData<Data>, b: InfiniteData<Data>) => boolean;
  getShouldRefetch?: (initialData: InfiniteData<Data>) => boolean;
  queryKeyAtom?: Atom<QueryKey> | PrimitiveAtom<QueryKey>;
}

export type AtomWithQueryFn<Data> = (get: Getter) => Data | Promise<Data>;
export type AtomWithInfiniteQueryFn<Data> = (
  get: Getter,
  context: QueryFunctionContext
) => Data | Promise<Data>;

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

export type AtomFamilyWithInfiniteQueryFn<Param, Data> = (
  get: Getter,
  param: Param,
  context: QueryFunctionContext
) => Data | Promise<Data>;

type ShouldRemove<Param> = (createdAt: number, param: Param) => boolean;

export type AtomFamily<Param, AtomType> = {
  (param: Param): AtomType;
  remove(param: Param): void;
  setShouldRemove(shouldRemove: ShouldRemove<Param> | null): void;
};
