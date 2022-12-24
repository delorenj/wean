import { initializeApp } from 'firebase/app';
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

import {createContext, useContext} from "react";
import useFirestore from "../hooks/useFirestore";

export const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const {docs} = useFirestore("settings")
  return (
    <SettingsContext.Provider value={ { docs } }>
      {children}
    </SettingsContext.Provider>
  );
};
