// authContext.js

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null); // User object
  const [isAuthenticated, setIsAuthenticated] = useState(undefined); // Authentication status
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    // Listen for authentication state changes
    const unsub = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        // User is signed in
        setIsAuthenticated(true);
        await fetchAndSetUserData(authUser);
      } else {
        // User is signed out
        setIsAuthenticated(false);
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // Function to fetch user data from Firestore and set the user state
  const fetchAndSetUserData = async (authUser) => {
    try {
      const userId = authUser.uid;
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setUser({
          uid: authUser.uid,
          email: authUser.email,
          username: data.username || '',
          profileUrl: data.profileUrl || '',
          userId: data.userId || authUser.uid,
        });
      } else {
        // If user document does not exist, create it
        await setDoc(doc(db, 'users', userId), {
          username: authUser.email.split('@')[0],
          profileUrl: '',
          userId: userId,
        });
        setUser({
          uid: authUser.uid,
          email: authUser.email,
          username: authUser.email.split('@')[0],
          profileUrl: '',
          userId: userId,
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (e) {
      console.error('Login error:', e);
      let msg = e.message;
      if (msg.includes('(auth/invalid-email)')) msg = 'Invalid email';
      if (msg.includes('(auth/user-not-found)')) msg = 'User not found';
      if (msg.includes('(auth/wrong-password)')) msg = 'Incorrect password';
      return { success: false, msg };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (e) {
      console.error('Logout error:', e);
      return { success: false, msg: e.message, error: e };
    }
  };

  // Register function
  const register = async (email, password, username) => {
    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);
      const userId = response.user.uid;
      const defaultProfileUrl =
        'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png';

      await setDoc(doc(db, 'users', userId), {
        username,
        profileUrl: defaultProfileUrl,
        userId: userId,
      });

      // Set the user state
      setUser({
        uid: userId,
        email: email,
        username: username,
        profileUrl: defaultProfileUrl,
        userId: userId,
      });

      setIsAuthenticated(true);

      return { success: true, data: response.user };
    } catch (e) {
      console.error('Registration error:', e);
      let msg = e.message;
      if (msg.includes('(auth/invalid-email)')) msg = 'Invalid email';
      if (msg.includes('(auth/email-already-in-use)')) msg = 'This email is already in use';
      return { success: false, msg };
    }
  };

  // Provide a loading state to prevent rendering before authentication status is known
  if (loading) {
    return null; // Or render a loading indicator
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
};
