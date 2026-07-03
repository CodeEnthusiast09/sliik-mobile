import { useInfiniteQuery } from '@tanstack/react-query';

import { getProviders } from '@/services/discovery';
import type { ProvidersQuery } from '@/interfaces/provider';

export function useProviders(filters: Omit<ProvidersQuery, 'page'>) {
  return useInfiniteQuery({
    queryKey: ['discovery', 'providers', filters],
    queryFn: ({ pageParam }) => getProviders({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.totalPages ? lastPage.meta.page + 1 : undefined,
  });
}
