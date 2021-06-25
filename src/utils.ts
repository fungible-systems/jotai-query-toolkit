export const makeQueryKey = (key: string, param?: unknown): [string, unknown] | string =>
  param ? [key, param] : key;
