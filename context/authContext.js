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

// Create the AuthContext
export const AuthContext = createContext();

// AuthContextProvider Component
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

    // Cleanup subscription on unmount
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
          firstName: data.firstName || '',    // New field
          lastName: data.lastName || '',      // New field
          profileUrl: data.profileUrl || '',
          userId: data.userId || authUser.uid,
        });
      } else {
        // If user document does not exist, create it
        await setDoc(doc(db, 'users', userId), {
          username: authUser.email.split('@')[0],
          firstName: '',                      // Initialize firstName
          lastName: '',                       // Initialize lastName
          profileUrl: '',
          userId: userId,
        });
        setUser({
          uid: userId,
          email: authUser.email,
          username: authUser.email.split('@')[0],
          firstName: '',                      // Initialize firstName
          lastName: '',                       // Initialize lastName
          profileUrl: '',
          userId: userId,
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Function to update user data (e.g., after profile picture change)
  const updateUserData = async (userId) => {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUser((prevUser) => ({
          ...prevUser,
          username: data.username || prevUser.username,
          firstName: data.firstName || prevUser.firstName, // Update firstName
          lastName: data.lastName || prevUser.lastName,     // Update lastName
          profileUrl: data.profileUrl || prevUser.profileUrl,
          userId: data.userId || userId,
        }));
      } else {
        console.log('User document does not exist for update');
      }
    } catch (error) {
      console.error('Error updating user data:', error);
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

  // Updated Register function
  const register = async (email, password, username, firstName, lastName) => {
    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);
      const userId = response.user.uid;
      const defaultProfileUrl =
        'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png';

      // Store additional user information in Firestore
      await setDoc(doc(db, 'users', userId), {
        username,
        firstName,      // New field
        lastName,       // New field
        profileUrl: defaultProfileUrl,
        userId: userId,
      });

      // Set the user state
      setUser({
        uid: userId,
        email: email,
        username: username,
        firstName: firstName,   // New field in state
        lastName: lastName,     // New field in state
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
        updateUserData, // Existing function
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
