export interface ReviewerSummary {
  fullName: string;
  avatarUrl: string | null;
}

export interface Review {
  id: string;
  bookingId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer?: ReviewerSummary | null;
}

export interface UserReviews {
  averageRating: number | null;
  totalReviews: number;
  reviews: Review[];
}
