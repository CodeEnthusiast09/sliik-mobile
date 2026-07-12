import { Redirect, useLocalSearchParams } from 'expo-router';

export default function Register() {
  const { role } = useLocalSearchParams<{ role?: string }>();

  return (
    <Redirect
      href={{
        pathname: '/auth',
        params: { mode: 'signup', ...(role ? { role } : {}) },
      }}
    />
  );
}
