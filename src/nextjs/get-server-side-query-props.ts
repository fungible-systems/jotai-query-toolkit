import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { GetQueries, Queries, QueryPropsGetter } from './types';
import { getInitialPropsFromQueries } from './get-initial-props-from-queries';
import { queryClient } from 'jotai-query-toolkit';

export function getServerSideQueryProps<QueryProps = undefined, PageProps = any>(
  getQueries: Queries<QueryProps> | GetQueries<QueryProps>,
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

      const promises: Promise<any>[] = [
        getInitialPropsFromQueries<QueryProps>({
          getQueries,
          getQueryProps,
          ctx,
          queryClient,
        }),
        _getServerSideProps(),
      ];

      const [initialQueryData, serverProps] = await Promise.all(promises);

      if (!('props' in serverProps)) return serverProps;
      return {
        props: {
          ...serverProps.props,
          initialQueryData,
        },
      };
    };
  };
}
