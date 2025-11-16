import React from 'react';
import { Slot } from "expo-router";
import "../global.css";
import { AuthContextProvider, useAuth } from '../context/authContext';
import { MenuProvider } from 'react-native-popup-menu';
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';

const MainLayout = () => {
    const { isAuthenticated } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        // check if user is authenticated or not
        if (typeof isAuthenticated === 'undefined') return;
        const inApp = segments[0] === '(app)';
        if (isAuthenticated && !inApp) {
            // redirect to home
            router.replace('(app)/Dashboard');
        } else if (isAuthenticated === false) {
            // redirect to signIn
            router.replace('signIn');
        }
    }, [isAuthenticated, segments, router]);

    return <Slot />;
};

export default function RootLayout() {
  return (
    <MenuProvider>
      <AuthContextProvider>
        <MainLayout />
      </AuthContextProvider>
    </MenuProvider>
  );
}