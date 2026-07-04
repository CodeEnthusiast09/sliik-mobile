import type { CustomerProfile } from './customer';
import type { ProviderProfile } from './provider';

export type OfferStatus = 'open' | 'accepted' | 'expired' | 'cancelled';
export type OfferResponseStatus = 'pending' | 'accepted' | 'declined';

export interface Offer {
  id: string;
  customerId: string;
  serviceType: string;
  description: string;
  budget: string | null;
  preferredFrom: string;
  preferredTo: string;
  city: string;
  status: OfferStatus;
  createdAt: string;
  updatedAt: string;
  customer?: CustomerProfile;
  responses?: OfferResponse[];
}

export interface OfferResponse {
  id: string;
  offerId: string;
  providerId: string;
  offeredPrice: string;
  message: string | null;
  status: OfferResponseStatus;
  createdAt: string;
  updatedAt: string;
  provider?: ProviderProfile;
  offer?: Offer;
}
