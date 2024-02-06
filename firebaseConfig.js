import { initializeApp } from "firebase/app";

import {getReactNativePersistence, initializeAuth} from 'firebase/auth';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getFirestore, collection} from 'firebase/firestore'


// 1. create new project on firebase console
// 2. create a web app and copy the firebseConfigs below 
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);

export const usersRef = collection(db, 'users');
export const roomRef = collection(db, 'rooms');
