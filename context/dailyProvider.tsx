import {createContext, useContext, useState} from "react";
import {Dose} from "../hooks/useDoses";
export const DailyContext = createContext(null);
export const useDaily = () => useContext(DailyContext);

export const DailyProvider = ({ children }) => {
  const date = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(date);
  const [isFirstRender, setIsFirstRender] = useState<boolean>(true);
  const [doses, setDoses] = useState<Dose[]>([]);
  return (
    <DailyContext.Provider value={ { selectedDate, setSelectedDate, isFirstRender, setIsFirstRender } }>
      {children}
    </DailyContext.Provider>
  );
};
