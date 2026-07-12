import { Redirect } from 'expo-router';

export default function Login() {
  return <Redirect href={{ pathname: '/auth', params: { mode: 'signin' } }} />;
}
