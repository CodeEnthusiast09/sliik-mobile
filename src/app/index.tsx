import { Redirect } from 'expo-router';

import { WelcomeScreen } from '@/screens/welcome';
import { useAuthStore } from '@/store/auth';

export default function Index() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const role = useAuthStore((state) => state.role);
  const isLoggedIn = Boolean(accessToken && role);

  if (isLoggedIn) {
    return <Redirect href={role === 'provider' ? '/profile' : '/home'} />;
  }

  return <WelcomeScreen />;
}
