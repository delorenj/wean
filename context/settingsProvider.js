import {createContext} from "react";
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
