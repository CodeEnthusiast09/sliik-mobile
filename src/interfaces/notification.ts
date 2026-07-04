export type NotificationType =
  | 'booking_created'
  | 'booking_confirmed'
  | 'booking_declined'
  | 'booking_cancelled'
  | 'booking_completed'
  | 'booking_reminder'
  | 'offer_posted'
  | 'offer_response_received'
  | 'offer_accepted'
  | 'deal_posted'
  | 'deal_claimed'
  | 'payment_received'
  | 'payment_sent'
  | 'review_received'
  | 'message_received'
  | 'system';

export interface NotificationData {
  bookingId?: string;
  offerId?: string;
  dealId?: string;
  responseId?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: NotificationData | null;
  readAt: string | null;
  createdAt: string;
}
