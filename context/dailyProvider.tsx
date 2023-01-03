import {createContext, useContext, useState} from "react";

export const DailyContext = createContext(null);
export const useDaily = () => useContext(DailyContext);

export const DailyProvider = ({ children }) => {
  const date = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(date);

  return (
    <DailyContext.Provider value={ { selectedDate, setSelectedDate } }>
      {children}
    </DailyContext.Provider>
  );
};
