import {createContext, useContext, useState} from "react";

export const DailyContext = createContext(null);
export const useDaily = () => useContext(DailyContext);

export const DailyProvider = ({ children }) => {
  const date = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(date);
  const [doses, setDoses] = useState<Dose[]>(0);
  return (
    <DailyContext.Provider value={ { selectedDate, setSelectedDate } }>
      {children}
    </DailyContext.Provider>
  );
};
