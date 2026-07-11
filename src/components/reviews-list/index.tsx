import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Text, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import type { Review } from '@/interfaces/review';
import { formatRelativeTime } from '@/lib/utils';

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
                {'☆'.repeat(5 - review.rating)} {review.rating.toFixed(1)}{' '}
                <Text className="text-[13px] text-[#817F80]">
                  · {formatRelativeTime(review.createdAt)}
                </Text>
              </Text>
            </View>
            {/* Every review requires a completed booking (reviews.service.ts
                rejects anything else), so this is always true, not decoration. */}
            <View className="flex-row items-center gap-1 rounded-full bg-[#EAF6EC] px-2.5 py-1">
              <Ionicons name="checkmark-circle" size={12} color="#2F9E44" />
              <Text className="text-[11px] font-bold text-[#2F9E44]">
                Verified
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
