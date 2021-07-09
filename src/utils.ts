import type { QueryKey } from 'react-query';

const spreadableSymbol = Symbol ? Symbol.isConcatSpreadable : undefined;

function getTag(value: any) {
  if (value == null) {
    return value === undefined ? '[object Undefined]' : '[object Null]';
  }
  return toString.call(value);
}

function isObjectLike(value: any) {
  return typeof value === 'object' && value !== null;
}

function isArguments(value: any) {
  return isObjectLike(value) && getTag(value) == '[object Arguments]';
}

function isFlattenable(value: any) {
  return (
    Array.isArray(value) ||
    isArguments(value) ||
    !!(spreadableSymbol && value && value[spreadableSymbol])
  );
}

export function makeQueryKey<P>(key: QueryKey, param?: P): [QueryKey, P] | QueryKey {
  const flattenedKey = isFlattenable(key) ? (key as any).flat() : key;
  const flattenedParam = param ? (isFlattenable(param) ? (param as any).flat(100) : param) : null;
  return flattenedParam ? [flattenedKey, flattenedParam].flat(100) : flattenedKey;
}

export const queryKeyCache = new WeakMap();

export function makeError(message: string) {
  return new Error(`[jotai-query-toolkit] ${message}`);
}
