import { ActivityIndicator, Text, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import type { Review } from '@/interfaces/review';

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
    <View>
      <Text className="mb-3 text-[15px] font-bold text-[#26242A]">
        {totalReviews > 0
          ? `★ ${averageRating?.toFixed(1)} (${totalReviews} review${totalReviews === 1 ? '' : 's'})`
          : 'No reviews yet'}
      </Text>

      {reviews.map((review) => (
        <View
          key={review.id}
          className="mb-2 gap-2 rounded-[20px] border border-[#ECE7E0] bg-white p-4"
        >
          <View className="flex-row items-center gap-2.5">
            <Avatar
              uri={review.reviewer?.avatarUrl}
              name={review.reviewer?.fullName ?? '?'}
              size={36}
            />
            <View className="flex-1">
              <Text className="font-serif-bold text-[14px] text-[#26242A]">
                {review.reviewer?.fullName ?? 'Sliik user'}
              </Text>
              <Text className="text-[13px] text-[#E0A800]">
                {'★'.repeat(review.rating)}
                {'☆'.repeat(5 - review.rating)}{' '}
                <Text className="text-[13px] text-[#817F80]">
                  · {new Date(review.createdAt).toLocaleDateString()}
                </Text>
              </Text>
            </View>
          </View>
          {review.comment && (
            <Text className="text-[14px] text-[#26242A]">{review.comment}</Text>
          )}
        </View>
      ))}
    </View>
  );
}
