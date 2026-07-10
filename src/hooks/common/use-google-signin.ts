import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useRef } from 'react';

// Finishes the auth session when the browser redirects back to the app.
WebBrowser.maybeCompleteAuthSession();

// Wraps Google's id-token OAuth request. On web this returns an id_token
// directly (implicit flow), which is our current dev target. Native builds need
// the ios/android client IDs plus a dev build, added later. `onToken` fires once
// the flow completes successfully.
export function useGoogleSignIn(onToken: (idToken: string) => void) {
  const onTokenRef = useRef(onToken);
  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.params.id_token;
      if (idToken) onTokenRef.current(idToken);
    }
  }, [response]);

  return { request, promptAsync };
}
