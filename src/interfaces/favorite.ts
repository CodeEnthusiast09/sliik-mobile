import type { ProviderProfile } from './provider';

export interface Favorite {
  id: string;
  customerId: string;
  providerId: string;
  createdAt: string;
  provider?: ProviderProfile;
}
