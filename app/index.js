import { Redirect } from 'expo-router';

export default function Index() {
  // Authentication is disabled - redirect to dashboard by default
  // You can change this to any route you want as the default
  return <Redirect href="/(app)/Dashboard" />;
}
