import {createContext, useContext} from "react";
import useFirestore from "../hooks/useFirestore";
import useFireauth from "../hooks/useFireauth";

export const DosesContext = createContext(null);

export const DosesProvider = ({ children }) => {
  const {user} = useFireauth();
  const {docs} = user ? useFirestore(`doses-${user.uid}`) : {docs: []};
  return (
    <DosesContext.Provider value={ { docs } }>
      {children}
    </DosesContext.Provider>
  );
};
