export const IS_SSR = typeof document === 'undefined';
export const QueryRefreshRates: Record<'Default' | 'Fast' | 'RealTime' | 'None', number | false> = {
  Default: 10_000,
  Fast: 5_000,
  RealTime: 2_000,
  None: false,
};
