import { isRunningInExpoGo } from 'expo';

/**
 * True when running inside the generic Expo Go client app, as opposed to a
 * custom development build or a production build. Several native APIs and
 * OAuth flows are unavailable in Expo Go and need to be guarded behind this
 * check rather than attempted and allowed to throw.
 */
export const isExpoGo = isRunningInExpoGo();
