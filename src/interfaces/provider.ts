export interface ProviderProfile {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  phone: string | null;
  bio: string | null;
  tradeType: string;
  yearsExperience: number;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  avgRating: string;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
  services?: Service[];
  portfolio?: PortfolioItem[];
  availability?: AvailabilitySlot[];
  daysOff?: DayOff[];
}

export interface Service {
  id: string;
  providerId: string;
  name: string;
  description: string | null;
  price: string;
  durationMinutes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioItem {
  id: string;
  providerId: string;
  imageUrl: string;
  caption: string | null;
  createdAt: string;
}

export interface AvailabilitySlot {
  id: string;
  providerId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface DayOff {
  id: string;
  providerId: string;
  date: string;
  reason: string | null;
  createdAt: string;
}

export interface Bank {
  name: string;
  code: string;
}

export interface PayoutAccount {
  id: string;
  providerId: string;
  paystackSubaccountCode: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}
