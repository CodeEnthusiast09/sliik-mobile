export type UserRole = 'customer' | 'provider';

export interface AuthData {
  accessToken: string;
  role: UserRole;
}

// POST /auth/register no longer returns a token: password signups must verify
// their email first. It echoes the email so the verify screen knows the target.
export interface RegisterData {
  email: string;
}
