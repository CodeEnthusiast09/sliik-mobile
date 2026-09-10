import type * as ExpoNotifications from 'expo-notifications';
import { isExpoGo } from '@/lib/environment';

export { isExpoGo };

/**
 * `expo-notifications` runs a device-push auto-registration side effect the
 * moment it is imported. That side effect throws on Android when running
 * inside Expo Go on SDK 53+, since remote push was removed from Expo Go at
 * that SDK. Every call site in this app must check `isExpoGo` before calling
 * `loadNotifications()`, and must never statically `import` the package -
 * only `require` it lazily, inside functions, after that check passes.
 *
 * https://docs.expo.dev/develop/development-builds/introduction/
 */

export function loadNotifications(): typeof ExpoNotifications {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('expo-notifications') as typeof ExpoNotifications;
}
