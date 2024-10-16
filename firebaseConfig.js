// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getReactNativePersistence, initializeAuth} from 'firebase/auth';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getFirestore, collection} from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCx1AoQEcPkMgydHZ6qsJCBDLKDfnoPePI",
  authDomain: "campusconnect-1ffa8.firebaseapp.com",
  projectId: "campusconnect-1ffa8",
  storageBucket: "campusconnect-1ffa8.appspot.com",
  messagingSenderId: "1005578659450",
  appId: "1:1005578659450:web:d67bdd79b09abab15e7dc3",
  measurementId: "G-655KRD5617"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);

export const usersRef = collection(db, 'users');
export const roomRef = collection(db, 'rooms');