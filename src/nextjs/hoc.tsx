import { NextPage, NextPageContext } from 'next';
import React, { memo } from 'react';
import { getInitialPropsFromQueries, Queries } from './index';
import { QueryProvider } from './query-provider';

export function withInitialQueries<Props>(WrappedComponent: NextPage) {
  return (queries: Queries) => {
    if (!queries) throw Error('Need to pass queries');
    const Wrapper: NextPage<any> = memo(({ initialQueryData, ...props }) => {
      return (
        <QueryProvider
          queryKeys={queries.map(([queryKey]) => queryKey)}
          initialQueryData={initialQueryData}
        >
          <WrappedComponent {...props} />
        </QueryProvider>
      );
    });

    Wrapper.getInitialProps = async (ctx: NextPageContext) => {
      const promises = [getInitialPropsFromQueries(queries, ctx)];
      if (WrappedComponent.getInitialProps) {
        const asyncGetInitialProps = async () => WrappedComponent?.getInitialProps?.(ctx) || {};
        promises.push(asyncGetInitialProps());
      }

      const [initialQueryData, componentProps] = await Promise.all(promises);

      return { initialQueryData, ...componentProps };
    };

    return Wrapper;
  };
}
