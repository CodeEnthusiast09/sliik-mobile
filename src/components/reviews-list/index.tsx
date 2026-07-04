import { ActivityIndicator } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { Review } from '@/interfaces/review';

import { styles } from './index.styles';

interface ReviewsListProps {
  averageRating: number | null;
  totalReviews: number;
  reviews: Review[];
  isLoading?: boolean;
}

export function ReviewsList({ averageRating, totalReviews, reviews, isLoading }: ReviewsListProps) {
  if (isLoading) {
    return <ActivityIndicator />;
  }

  return (
    <ThemedView>
      <ThemedText type="default" style={styles.summary}>
        {totalReviews > 0
          ? `★ ${averageRating?.toFixed(1)} (${totalReviews} review${totalReviews === 1 ? '' : 's'})`
          : 'No reviews yet'}
      </ThemedText>

      {reviews.map((review) => (
        <ThemedView key={review.id} type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold">{review.reviewer?.fullName ?? 'Sliik user'}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {'★'.repeat(review.rating)}
            {'☆'.repeat(5 - review.rating)} · {new Date(review.createdAt).toLocaleDateString()}
          </ThemedText>
          {review.comment && <ThemedText type="default">{review.comment}</ThemedText>}
        </ThemedView>
      ))}
    </ThemedView>
  );
}
