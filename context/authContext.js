// authContext.js
// AUTHENTICATION COMPLETELY COMMENTED OUT
// All authentication functionality is disabled

import React, { createContext, useContext } from 'react';
// AUTHENTICATION COMMENTED OUT
// import { createContext, useContext, useEffect, useState } from 'react';

// Create the AuthContext
export const AuthContext = createContext();

// AuthContextProvider Component - COMPLETELY DISABLED
// Returns safe defaults so other files don't crash
export const AuthContextProvider = ({ children }) => {
  // AUTHENTICATION COMPLETELY COMMENTED OUT
  // const [user, setUser] = useState(null);
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  // const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   setIsAuthenticated(false);
  //   setUser(null);
  //   setLoading(false);
  // }, []);

  // Stub functions - all return safe defaults
  const updateUserData = async (userId) => {
    // AUTHENTICATION DISABLED
    return;
  };

  const login = async (email, password) => {
    // AUTHENTICATION DISABLED
    return { success: false, msg: 'Authentication is currently disabled' };
  };

  const logout = async () => {
    // AUTHENTICATION DISABLED
    return { success: true };
  };

  const register = async (email, password, username, firstName, lastName) => {
    // AUTHENTICATION DISABLED
    return { success: false, msg: 'Authentication is currently disabled' };
  };

  // Return safe defaults
  return (
    <AuthContext.Provider
      value={{
        user: null, // Always null since auth is disabled
        isAuthenticated: false, // Always false since auth is disabled
        login,
        register,
        logout,
        updateUserData,
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
