export type UserRole = 'customer' | 'provider';

export interface AuthData {
  accessToken: string;
  role: UserRole;
}
