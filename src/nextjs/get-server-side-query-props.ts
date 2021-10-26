import { getInitialPropsFromQueries } from './get-initial-props-from-queries';
import { queryClient } from 'jotai-query-toolkit';
import type { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import type { GetQueries, Queries, QueryPropsGetter } from './types';

export function getServerSideQueryProps<QueryProps = undefined, PageProps = any>(
  getQueries?: Queries<QueryProps> | GetQueries<QueryProps>,
  getQueryProps?: QueryPropsGetter<QueryProps>
) {
  return (getServerSideProps?: GetServerSideProps<PageProps>) => {
    return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<PageProps>> => {
      const _getServerSideProps = async (): Promise<
        { props: {} } | GetServerSidePropsResult<PageProps>
      > => {
        if (getServerSideProps) return getServerSideProps(ctx);
        return { props: {} };
      };

      const promises: Promise<any>[] = [_getServerSideProps()];

      if (typeof getQueries !== 'undefined') {
        promises.push(
          getInitialPropsFromQueries<QueryProps>({
            getQueries,
            getQueryProps,
            ctx,
            queryClient,
          })
        );
      }

      // const [serverProps, initialQueryData] = await Promise.all(promises);

      return {
        props: {
          ...(serverProps?.props || {}),
          initialQueryData,
        },
      };
    };
  };
}
