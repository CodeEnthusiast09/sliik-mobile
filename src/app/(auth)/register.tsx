import { Redirect, useLocalSearchParams } from 'expo-router';

export default function Register() {
  const { role } = useLocalSearchParams<{ role?: string }>();

  if (role !== 'customer' && role !== 'provider') {
    return <Redirect href="/role-select" />;
  }

  return (
    <Redirect
      href={{
        pathname: '/auth',
        params: { mode: 'signup', ...(role ? { role } : {}) },
      }}
    />
  );
}
