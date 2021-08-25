export const IS_SSR = typeof window === 'undefined';
export const IS_DEV = typeof process === 'object' && process?.env?.NODE_ENV !== 'production';
export const QueryRefreshRates: Record<'Default' | 'Fast' | 'RealTime' | 'None', number | false> = {
  Default: 10000,
  Fast: 5000,
  RealTime: 2000,
  None: false,
};
