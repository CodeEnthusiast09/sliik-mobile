import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createReview } from '@/services/reviews';
import type { CreateReviewInput } from '@/validations/review';

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReviewInput) => createReview(payload),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'booking', variables.bookingId] });
      if (response.data) {
        queryClient.invalidateQueries({ queryKey: ['reviews', 'user', response.data.revieweeId] });
      }
    },
  });
}
