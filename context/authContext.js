// authContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const AuthContext = createContext();

export const AuthContextProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if(user) {
        setIsAuthenticated(true);
        setUser(user);
        await updateUserData(user.uid);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    });
    return unsub;
  }, []);

  const updateUserData = async (userId) => {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      if(docSnap.exists()) {
        let data = docSnap.data();
        setUser((prevUser) => ({
          ...prevUser,
          username: data.username,
          profileUrl: data.profileUrl,
          userId: data.userId,
        }));
      }
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      return {success: true};
    } catch (e) {
      let msg = e.message;
      if(msg.includes('(auth/invalid-email)')) msg='Invalid email';
      if(msg.includes('(auth/invalid-credential)')) msg='Wrong credentials';
      return {success: false, msg};
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsAuthenticated(false);
      return {success: true};
    } catch (e) {
      console.error('Logout error:', e);
      return {success: false, msg: e.message, error: e};
    }
  };

  const register = async (email, password, username, profileUrl) => {
    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);
      const defaultProfileUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png";
      
      await setDoc(doc(db, "users", response?.user?.uid), {
        username,
        profileUrl: defaultProfileUrl,
        userId: response?.user?.uid
      });
      
      return {success: true, data: response?.user};
    } catch (e) {
      let msg = e.message;
      if(msg.includes('(auth/invalid-email)')) msg='Invalid email';
      if(msg.includes('(auth/email-already-in-use)')) msg='This email is already in use';
      return {success: false, msg};
    }
  };

  return (
    <AuthContext.Provider value={{
      user, 
      isAuthenticated, 
      login, 
      register, 
      logout,
      updateUserData
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const value = useContext(AuthContext);
  if(!value) {
    throw new Error('useAuth must be wrapped inside AuthContextProvider');
  }
  return value;
};