import { initializeApp } from 'firebase/app';
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

import {createContext, useContext} from "react";
// Initialize Firebase
export const firebaseConfig = {
  apiKey: 'AIzaSyDXh34Ns3tNXWH3tAzlLQnc9Wh3wrrFPRE',
  authDomain: 'wean-17739.firebaseapp.com',
  projectId: "wean-17739",
  storageBucket: "wean-17739.appspot.com",
  messagingSenderId: "385319022932",
  appId: "1:385319022932:web:15c8c9d621874487b2d8c1",
  measurementId: "G-DPMJHN70HD"
};

// Initialize Firebase
export const FirebaseContext = createContext(null)
export const useFirebase = () => useContext(FirebaseContext)
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export const FirebaseProvider = ({ children }) => {
  return (
    <FirebaseContext.Provider value={ {app, db, auth} }>
      {children}
    </FirebaseContext.Provider>
  );
};
