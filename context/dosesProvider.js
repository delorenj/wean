import {createContext, useContext} from "react";
import useFirestore from "../hooks/useFirestore";
import { AuthContext } from './AuthProvider'; // Assuming you have an AuthProvider to get the current user's id

export const DosesContext = createContext(null);

export const DosesProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext); // get current user from AuthContext
  const {docs} = useFirestore(`doses-${currentUser.uid}`) // assuming currentUser.uid gives the userId
  return (
    <DosesContext.Provider value={ { docs } }>
      {children}
    </DosesContext.Provider>
  );
};
