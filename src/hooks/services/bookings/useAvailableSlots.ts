import { useQuery } from '@tanstack/react-query';

import { getAvailableSlots } from '@/services/bookings';

export function useAvailableSlots(providerId: string, date: string, serviceId: string) {
  return useQuery({
    queryKey: ['bookings', 'available-slots', providerId, date, serviceId],
    queryFn: async () => {
      const response = await getAvailableSlots(providerId, date, serviceId);
      return response.data;
    },
    enabled: !!providerId && !!date && !!serviceId,
  });
}
