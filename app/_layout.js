import React, { Component } from 'react';
import { Slot } from "expo-router";
import { View, Text, StyleSheet } from 'react-native';
import "../global.css";
// AUTHENTICATION COMMENTED OUT - but keeping provider for other files that use useAuth
import { AuthContextProvider } from '../context/authContext';
// import { useAuth } from '../context/authContext';
import { MenuProvider } from 'react-native-popup-menu';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Error Boundary Component
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.text}>Something went wrong</Text>
          <Text style={styles.error}>{this.state.error?.message || 'Unknown error'}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const MainLayout = () => {
    // AUTHENTICATION COMMENTED OUT
    // try {
    //     const { isAuthenticated } = useAuth();
    //     const segments = useSegments();
    //     const router = useRouter();

    //     useEffect(() => {
    //         // Authentication is disabled - allow navigation to any route
    //         // Skip authentication checks for now
    //         // const inApp = segments[0] === '(app)';
    //         // if (isAuthenticated && !inApp) {
    //         //     router.replace('(app)/Dashboard');
    //         // } else if (isAuthenticated === false) {
    //         //     router.replace('signIn');
    //         // }
    //     }, [isAuthenticated, segments, router]);

    //     return <Slot />;
    // } catch (error) {
    //     console.error('Error in MainLayout:', error);
    //     return (
    //         <View style={styles.container}>
    //             <Text style={styles.text}>Error in MainLayout</Text>
    //             <Text style={styles.error}>{error.message}</Text>
    //         </View>
    //     );
    // }
    return <Slot />;
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <MenuProvider>
          {/* AUTHENTICATION DISABLED - but keeping provider so other files don't crash */}
          <AuthContextProvider>
            <MainLayout />
          </AuthContextProvider>
        </MenuProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
  error: {
    color: 'red',
    fontSize: 14,
  },
});

