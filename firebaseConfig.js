import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getReactNativePersistence, initializeAuth, getAuth } from 'firebase/auth';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore, collection } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyCx1AoQEcPkMgydHZ6qsJCBDLKDfnoPePI",
  authDomain: "campusconnect-1ffa8.firebaseapp.com",
  projectId: "campusconnect-1ffa8",
  storageBucket: "campusconnect-1ffa8.appspot.com",
  messagingSenderId: "1005578659450",
  appId: "1:1005578659450:web:d67bdd79b09abab15e7dc3",
  measurementId: "G-655KRD5617"
};

export default firebaseConfig;
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
const usersRef = collection(db, 'users');
const roomRef = collection(db, 'rooms');

export {
  auth,
  db,
  functions,
  usersRef,
  roomRef
};