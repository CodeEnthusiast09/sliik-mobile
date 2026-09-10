import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { isExpoGo } from '@/lib/environment';
import { showToast } from '@/store/toast';

// Finishes the auth session when the browser redirects back to the app.
WebBrowser.maybeCompleteAuthSession();

type GoogleAuthRequest = ReturnType<typeof Google.useIdTokenAuthRequest>[0];

export interface UseGoogleSignInResult {
  request: GoogleAuthRequest;
  promptAsync: () => Promise<void>;
}

/**
 * expo-auth-session's Google provider needs platform-specific client IDs on
 * native, and native Google sign-in cannot complete inside Expo Go at all,
 * regardless of configuration - Expo removed the auth proxy that used to
 * make this work. See:
 * forums.expo.dev/t/why-was-google-auth-deprecated-expo-go-support/73161
 *
 * On web this returns an id_token directly (implicit flow), which is our
 * current dev target. Native builds need the ios/android client IDs plus a
 * development build, added later - until then, native + Expo Go returns a
 * disabled/no-op result instead of calling the real hook.
 */
export function useGoogleSignIn(onToken: (idToken: string) => void): UseGoogleSignInResult {
  const onTokenRef = useRef(onToken);
  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  const unsupported = Platform.OS !== 'web' && isExpoGo;

  // `unsupported` is fixed for the lifetime of the running app (see comment
  // above `isExpoGo`), so this conditional hook call is stable across every
  // render and does not violate the Rules of Hooks in practice - the linter
  // just can't verify that statically.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [request, response, promptAsync] = unsupported
    ? [null, null, null]
    : Google.useIdTokenAuthRequest({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.params.id_token;
      if (idToken) onTokenRef.current(idToken);
    }
  }, [response]);

  return {
    request,
    promptAsync: async () => {
      if (!promptAsync) {
        showToast('Google sign-in requires a development build here - unavailable in Expo Go.');
        return;
      }
      await promptAsync();
    },
  };
}
