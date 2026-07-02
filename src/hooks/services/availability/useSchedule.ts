import { useQuery } from '@tanstack/react-query';

import { getSchedule } from '@/services/availability';

export function useSchedule() {
  return useQuery({
    queryKey: ['availability', 'schedule'],
    queryFn: async () => {
      const response = await getSchedule();
      return response.data ?? [];
    },
  });
}
