import { initializeApp } from 'firebase/app';
import { getFirestore } from "firebase/firestore";
import {createContext, useContext} from "react";
// Initialize Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyDXh34Ns3tNXWH3tAzlLQnc9Wh3wrrFPRE',
  authDomain: 'wean-17739.firebaseapp.com',
  projectId: "wean-17739",
  storageBucket: "wean-17739.appspot.com",
  messagingSenderId: "385319022932",
  appId: "1:385319022932:web:15c8c9d621874487b2d8c1",
  measurementId: "G-DPMJHN70HD"
};

// Initialize Firebase
const FirebaseContext = createContext(null)
export const useFirebase = () => useContext(FirebaseContext)

export const FirebaseProvider = ({ children, firebaseConfig }) => {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  return (
    <FirebaseContext.Provider value={ {app, db} }>
      {children}
    </FirebaseContext.Provider>
  );
};
