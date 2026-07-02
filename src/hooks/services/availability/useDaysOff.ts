import { useQuery } from '@tanstack/react-query';

import { getDaysOff } from '@/services/availability';

export function useDaysOff() {
  return useQuery({
    queryKey: ['availability', 'days-off'],
    queryFn: async () => {
      const response = await getDaysOff();
      return response.data ?? [];
    },
  });
}
