import { Redirect } from 'expo-router';
import { useAuth } from '../context/authContext';

export default function Index() {
  const { user } = useAuth();

  // If the user is already authenticated, redirect to the dashboard
  // Otherwise, redirect to the sign-in page
  if (user) {
    return <Redirect href="/(app)/Dashboard" />;
  } else {
    return <Redirect href="/signin" />;
  }
}
