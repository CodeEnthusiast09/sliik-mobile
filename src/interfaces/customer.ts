export interface CustomerProfile {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  phone: string | null;
  city: string | null;
  email: string;
  createdAt: string;
  updatedAt: string;
}
