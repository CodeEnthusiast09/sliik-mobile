import { create } from 'zustand';

import type { UserRole } from '@/interfaces/auth';

interface SignupFlowState {
  /** Role most recently shown on the Sign Up form, remembered so bouncing
   * Sign Up -> Sign In -> Sign Up (via the auth tabs) doesn't force Role Select again. */
  role: UserRole | null;
  setRole: (role: UserRole) => void;
}

export const useSignupFlowStore = create<SignupFlowState>((set) => ({
  role: null,
  setRole: (role) => set({ role }),
}));
