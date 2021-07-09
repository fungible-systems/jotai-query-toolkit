import { InfiniteData } from 'react-query';

export function asInfiniteData<Data>(data: Data): InfiniteData<Data> | undefined {
  if (!data) return;
  if ('pages' in data && 'pageParams' in data) return data as unknown as InfiniteData<Data>;
  return {
    pages: [data],
    pageParams: [undefined],
  };
}
