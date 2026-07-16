/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
    border: '#8888884D',
    tint: '#4B2E46',
    danger: '#e5484d',
    warning: '#e0a800',
    success: '#2f9e44',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
    border: '#FFFFFF33',
    tint: '#C79BB2',
    danger: '#e5484d',
    warning: '#e0a800',
    success: '#2f9e44',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/**
 * Fixed brand palette. Unlike `Colors` (which flips per theme), these stay
 * constant so brand surfaces (logo, filled buttons, splash) read the same in
 * light and dark mode. Sampled from the Sliik logo.
 */
export const Brand = {
  plum: '#4B2E46',
  plumPressed: '#3C2438',
  plumLight: '#C79BB2',
  cream: '#F7EFE4',
  charcoal: '#202124',
} as const;

/** Fraunces display serif weights (loaded via @expo-google-fonts/fraunces). */
export const DisplayFont = {
  regular: 'Fraunces_400Regular',
  semibold: 'Fraunces_600SemiBold',
  bold: 'Fraunces_700Bold',
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

// The floating pill tab bar's style, factored out so a screen that needs to hide
// it (chat-detail) can restore this exact object afterward - navigation.setOptions
// with `undefined` would fall back to React Navigation's plain default bar instead.
export const TAB_BAR_STYLE = {
  position: 'absolute' as const,
  left: 12,
  right: 12,
  bottom: Platform.select({ ios: 28, default: 16 }),
  height: 64,
  borderRadius: 32,
  backgroundColor: '#FFFFFF',
  borderTopWidth: 0,
  paddingTop: 4,
  paddingBottom: 4,
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 8,
};

// Mirrors the backend's CHATTABLE_STATUSES (chat.service.ts) - chat only
// opens once a provider confirms and stays open after completion.
export const CHATTABLE_STATUSES = ['confirmed', 'completed'];

// Client-side mirror of the backend's EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS.
// The server enforces the real limit and silently drops early resends; this just
// gates the Resend button so the user isn't tapping a rate-limited endpoint blind.
export const RESEND_COOLDOWN_SECONDS = 60;

// Mirrors the backend's categoryEnum (src/db/schema/services.ts) - shared
// between service categorization and portfolio photo tagging.
export const CATEGORIES = [
  { value: 'hair', label: 'Hair' },
  { value: 'braids', label: 'Braids' },
  { value: 'wig_install', label: 'Wig Install' },
  { value: 'makeup', label: 'Makeup' },
  { value: 'lashes', label: 'Lashes' },
  { value: 'nails', label: 'Nails' },
  { value: 'barbering', label: 'Barbering' },
  { value: 'mens_grooming', label: "Men's Grooming" },
];

// Mirrors the backend's ADD_ON_VALUES (create-service.dto.ts).
export const ADD_ONS = [
  { value: 'beard_shape', label: 'Beard shape' },
  { value: 'hot_towel', label: 'Hot towel' },
  { value: 'eyebrow_trim', label: 'Eyebrow trim' },
  { value: 'deep_conditioning', label: 'Deep conditioning' },
  { value: 'scalp_massage', label: 'Scalp massage' },
];

// Preset options for the service duration dropdown.
export const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120].map((minutes) => ({
  value: String(minutes),
  label: `${minutes} min`,
}));
