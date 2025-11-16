// Import Firebase core first
import { initializeApp, getApps, getApp } from "firebase/app";

// AUTHENTICATION COMMENTED OUT
// Import Firebase Auth - ensure it's loaded
// import { getReactNativePersistence, initializeAuth, getAuth } from 'firebase/auth';
// import AsyncStorage from "@react-native-async-storage/async-storage";

// Import other Firebase services
import { getFirestore, collection, query, where, orderBy } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCx1AoQEcPkMgydHZ6qsJCBDLKDfnoPePI",
  authDomain: "campusconnect-1ffa8.firebaseapp.com",
  projectId: "campusconnect-1ffa8",
  storageBucket: "campusconnect-1ffa8.firebasestorage.app",
  messagingSenderId: "1005578659450",
  appId: "1:1005578659450:web:d67bdd79b09abab15e7dc3",
  measurementId: "G-655KRD5617"
};

// Initialize Firebase only if it hasn't been initialized
let app;
try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} catch (error) {
  console.error('Error initializing Firebase app:', error);
  throw error;
}

// AUTHENTICATION COMPLETELY COMMENTED OUT
// Initialize Auth with AsyncStorage persistence for React Native
// AUTHENTICATION IS DISABLED - Return null to prevent errors
// This allows other Firebase services (db, storage) to work without auth
// let authInstance = null;

// function initializeAuthInstance() {
//   // Authentication is disabled - return null silently
//   // This prevents Firebase Auth initialization errors
//   return null;
  
//   // Original code commented out:
//   // if (authInstance) {
//   //   return authInstance;
//   // }
//   // try {
//   //   try {
//   //     authInstance = getAuth(app);
//   //     return authInstance;
//   //   } catch (e) {
//   //     authInstance = initializeAuth(app, {
//   //       persistence: getReactNativePersistence(AsyncStorage)
//   //     });
//   //     return authInstance;
//   //   }
//   // } catch (error) {
//   //   return null;
//   // }
// }

// Initialize auth - returns null since auth is disabled
const auth = null; // AUTHENTICATION DISABLED

// Analytics is not available in React Native, skip initialization
// const analytics = getAnalytics(app);
let db;
let functions;
let storage;

try {
  db = getFirestore(app);
  functions = getFunctions(app, 'us-central1');
  storage = getStorage(app);
} catch (error) {
  console.error('Error initializing Firebase services:', error);
  // Don't throw - allow app to continue
  db = null;
  functions = null;
  storage = null;
}

// Collection references (only if db is initialized)
const usersRef = db ? collection(db, 'users') : null;
const roomRef = db ? collection(db, 'rooms') : null;
const postsRef = db ? collection(db, 'posts') : null;
const chatsRef = db ? collection(db, 'chats') : null;
const groupsRef = db ? collection(db, 'groups') : null;
const statusesRef = db ? collection(db, 'statuses') : null;

// Helper functions for subcollections
const messagesRef = (chatId) => db ? collection(db, 'chats', chatId, 'messages') : null;
const getChatMessages = (chatId) => db ? collection(db, 'chats', chatId, 'messages') : null;

// Helper functions for status
const getUserStatuses = (userId) => {
  if (!db || !statusesRef) return null;
  return query(
    statusesRef,
    where('userId', '==', userId),
    where('timestamp', '>', new Date(Date.now() - 24 * 60 * 60 * 1000)),
    orderBy('timestamp', 'desc')
  );
};

const getActiveStatuses = () => {
  if (!db || !statusesRef) return null;
  return query(
    statusesRef,
    where('timestamp', '>', new Date(Date.now() - 24 * 60 * 60 * 1000)),
    orderBy('timestamp', 'desc')
  );
};

const getStatusViewers = (statusId) => db ? collection(db, 'statuses', statusId, 'viewers') : null;

export {
  auth,
  db,
  functions,
  usersRef,
  roomRef,
  storage,
  postsRef,
  chatsRef,
  groupsRef,
  messagesRef,
  getChatMessages,
  statusesRef,
  getUserStatuses,
  getActiveStatuses,
  getStatusViewers
};