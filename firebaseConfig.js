import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getReactNativePersistence, initializeAuth, getAuth } from 'firebase/auth';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore, collection } from 'firebase/firestore';
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
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize services
let auth;
try {
  auth = getAuth(app);
} catch {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

const analytics = getAnalytics(app);
const db = getFirestore(app);
const functions = getFunctions(app, 'us-central1');
const storage = getStorage(app);

// Collection references
const usersRef = collection(db, 'users');
const roomRef = collection(db, 'rooms');
const postsRef = collection(db, 'posts');
const chatsRef = collection(db, 'chats');
const groupsRef = collection(db, 'groups');
const statusesRef = collection(db, 'statuses');

// Helper functions for subcollections
const messagesRef = (chatId) => collection(db, 'chats', chatId, 'messages');
const getChatMessages = (chatId) => collection(db, 'chats', chatId, 'messages');

// Helper functions for status
const getUserStatuses = (userId) => query(
  statusesRef,
  where('userId', '==', userId),
  where('timestamp', '>', new Date(Date.now() - 24 * 60 * 60 * 1000)),
  orderBy('timestamp', 'desc')
);

const getActiveStatuses = () => query(
  statusesRef,
  where('timestamp', '>', new Date(Date.now() - 24 * 60 * 60 * 1000)),
  orderBy('timestamp', 'desc')
);

const getStatusViewers = (statusId) => collection(db, 'statuses', statusId, 'viewers');

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