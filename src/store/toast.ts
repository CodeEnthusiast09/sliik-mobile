import { create } from 'zustand';

export type ToastVariant = 'default' | 'success' | 'error' | 'warning';

interface ToastState {
  message: string | null;
  variant: ToastVariant;
  /** Increments on every show() so the host can retrigger its animation. */
  token: number;
  show: (message: string, variant?: ToastVariant) => void;
  hide: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  variant: 'default',
  token: 0,
  show: (message, variant = 'default') =>
    set((state) => ({ message, variant, token: state.token + 1 })),
  hide: () => set({ message: null }),
}));

/** Fire a toast from anywhere (components, hooks, handlers). */
export function showToast(message: string, variant?: ToastVariant) {
  useToastStore.getState().show(message, variant);
}
