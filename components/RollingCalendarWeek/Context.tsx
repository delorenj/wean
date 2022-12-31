import {createContext, useContext, useState} from "react";

export const RollingCalendarWeekContext = createContext(null);
export const useRollingCalendarWeek = () => useContext(RollingCalendarWeekContext);

export const RollingCalendarWeekProvider = ({children}) => {
    const currentDate = new Date();
    const [selectedDate, setSelectedDate] = useState<Date>(currentDate);
    return (
        <RollingCalendarWeekContext.Provider value={ {selectedDate, setSelectedDate} }>
            {children}
        </RollingCalendarWeekContext.Provider>
    )

};
