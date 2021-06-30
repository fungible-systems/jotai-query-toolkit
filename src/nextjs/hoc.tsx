import { NextPage, NextPageContext } from 'next';
import React from 'react';
import { getInitialPropsFromQueries, Queries } from './index';

import { Provider } from 'jotai';
import { useQueryInitialValues } from './hooks';

export function withInitialQueries<QueryProps = unknown, PageProps = Record<string, unknown>>(
  WrappedComponent: NextPage<PageProps>
) {
  return (
    getQueries:
      | Queries<QueryProps>
      | ((
          ctx: NextPageContext,
          queryProps?: QueryProps
        ) => Queries<QueryProps> | Promise<Queries<QueryProps>>),
    getQueryProps?: (context: NextPageContext) => QueryProps | Promise<QueryProps>
  ): NextPage<PageProps> => {
    if (!getQueries) throw Error('Need to pass queries');

    const Wrapper: NextPage<{
      initialQueryData: Record<string, unknown>;
      initialValues?: any;
    }> = ({ initialQueryData, initialValues, ...props }) => {
      const initialQueries = useQueryInitialValues(initialQueryData);
      return (
        <Provider initialValues={[...initialQueries].concat(initialValues ?? [])}>
          <WrappedComponent {...(props as PageProps)} />
        </Provider>
      );
    };

    Wrapper.getInitialProps = async (ctx: NextPageContext) => {
      const promises = [
        await getInitialPropsFromQueries<QueryProps>(getQueries, ctx, getQueryProps),
      ];
      if (WrappedComponent.getInitialProps) {
        const asyncGetInitialProps = async () =>
          (await WrappedComponent?.getInitialProps?.(ctx)) || {};
        promises.push(asyncGetInitialProps());
      }

      const [initialQueryData, componentProps] = await Promise.all(promises);

      return { initialQueryData, ...componentProps };
    };

    return Wrapper as unknown as NextPage<PageProps>;
  };
}
