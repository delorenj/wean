import {createContext, useContext} from "react";
import useFirestore from "../hooks/useFirestore";
import useFireauth from "../hooks/useFireauth";

export const DosesContext = createContext(null);

export const DosesProvider = ({ children }) => {
  const {user} = useFireauth();
  const {docs} = useFirestore(user ? `doses-${user.uid}` : undefined);
  return (
    <DosesContext.Provider value={ { docs } }>
      {children}
    </DosesContext.Provider>
  );
};
