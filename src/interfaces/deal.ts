import type { ProviderProfile, Service } from './provider';

export interface Deal {
  id: string;
  providerId: string;
  serviceId: string;
  title: string;
  description: string | null;
  originalPrice: string;
  dealPrice: string;
  slotsTotal: number;
  slotsRemaining: number;
  startsAt: string | null;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  provider?: ProviderProfile;
  service?: Service;
}
