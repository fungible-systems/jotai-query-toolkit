import { NextPage, NextPageContext } from 'next';
import React, { useMemo } from 'react';
import { getInitialPropsFromQueries, GetQueries, Queries, QueryPropsGetter } from './index';

import { Provider } from 'jotai';
import { useQueryInitialValues } from './hooks';
import { hashQueryKey } from 'react-query';
import { queryClient } from '../query-client';

export function withInitialQueries<QueryProps = unknown, PageProps = Record<string, unknown>>(
  WrappedComponent: NextPage<PageProps>
) {
  return (
    getQueries: Queries<QueryProps> | GetQueries<QueryProps>,
    getQueryProps?: QueryPropsGetter<QueryProps>
  ): NextPage<PageProps> => {
    if (!getQueries) throw Error('Need to pass queries');

    const Wrapper: NextPage<{
      initialQueryData: Record<string, unknown>;
    }> = ({ initialQueryData, ...props }) => {
      const initialValues = useQueryInitialValues(initialQueryData);
      const keys = Object.keys(initialQueryData);
      // this key is very important, without passing key={key} to the Provider,
      // it won't know to re-render if someone navigates within the same page component (eg from one address to another)
      const key = useMemo(() => hashQueryKey(keys), [keys]);
      return (
        <Provider initialValues={initialValues} key={key}>
          <WrappedComponent {...(props as PageProps)} />
        </Provider>
      );
    };

    Wrapper.getInitialProps = async (ctx: NextPageContext) => {
      const promises = [
        await getInitialPropsFromQueries<QueryProps>({
          getQueries,
          getQueryProps,
          ctx,
          queryClient,
        }),
      ];
      if (WrappedComponent.getInitialProps) {
        const asyncGetInitialProps = async () =>
          (await WrappedComponent?.getInitialProps?.(ctx)) || {};
        promises.push(asyncGetInitialProps());
      }

      const [initialQueryData, componentProps] = await Promise.all(promises);

      return {
        initialQueryData,
        ...componentProps,
      };
    };

    return Wrapper as unknown as NextPage<PageProps>;
  };
}
