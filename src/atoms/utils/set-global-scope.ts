import { Scope } from 'jotai/core/atom';

export const cache = new WeakMap();
export const SCOPE_CACHE_KEY = { 'jotai-query-toolkit-scope': true } as const;

export function setScope(scope: Scope) {
  if (!cache.has(SCOPE_CACHE_KEY)) cache.set(SCOPE_CACHE_KEY, scope);
}
export function getScope() {
  if (cache.has(SCOPE_CACHE_KEY)) return cache.get(SCOPE_CACHE_KEY);
}
