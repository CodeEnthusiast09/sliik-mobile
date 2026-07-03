import type { CustomerProfile } from './customer';
import type { ProviderProfile, Service } from './provider';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'declined';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export interface Booking {
  id: string;
  customerId: string;
  providerId: string;
  serviceId: string;
  status: BookingStatus;
  scheduledAt: string;
  notes: string | null;
  totalAmount: string;
  paymentStatus: PaymentStatus;
  paymentProvider: 'paystack' | null;
  paymentReference: string | null;
  createdAt: string;
  updatedAt: string;
  service?: Service;
  provider?: ProviderProfile;
  customer?: CustomerProfile;
}

export interface AvailableSlots {
  date: string;
  slots: string[];
}
