import {Text, TouchableOpacity, View} from "react-native";
import { useRollingCalendarWeek } from "./Context";
import {Card, useTheme} from "react-native-paper";
import {useCallback, useMemo} from "react";

export const DaySelectors = () => {
  const theme = useTheme();
  const {selectedDate, setSelectedDate} = useRollingCalendarWeek();
  const currentDate = new Date();
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentDay = new Date().getDay(); // gets the current day as a number (0-6)

  const dayButtons = [];
  for (let i = -3; i <= 3; i++) {
    const dayDate = new Date();
    dayDate.setDate(currentDate.getDate() + i);
    const dayName = daysOfWeek[dayDate.getDay()];
    const dayDay = dayDate.getDate();
    const styles = useMemo(() => {
        return getStyles(theme, dayDate, selectedDate);
    }, [theme, dayDate, selectedDate])

    dayButtons.push(
      <TouchableOpacity style={styles.button}>
        <Text style={[styles.text,styles.dayName]}>{dayName}</Text>
        <Card style={styles.numCard}><Text style={styles.text}>{dayDay}</Text></Card>
      </TouchableOpacity>
    );
  }

  return (
    <View style={{padding:5, flexDirection: 'row', justifyContent: 'space-between'}}>
      {dayButtons}
    </View>
  );
};

  const getStyles = (theme, date, selectedDate) => ({
      button: {
          flex: 0.1,
          justifyContent: 'space-between' as 'space-between',
          backgroundColor: date.getDate() === selectedDate.getDate() ? theme.colors.primary : theme.colors.secondaryContainer,
          borderRadius: 10,
          height: 75,
          padding: 5,

      },
      numCard: {
          flex: 0,
          alignSelf: 'center' as 'center',
          borderRadius: 8,
          padding: 7
      },
      dayName: {
          textAlign: 'center' as 'center',
          alignSelf: 'center' as 'center',
          color: date.getDate() === selectedDate.getDate() ? theme.colors.onPrimary : theme.colors.onSecondaryContainer,

      },
      text: {
          textTransform: 'uppercase' as 'uppercase',
          fontSize: 10,
          fontWeight: 'bold' as 'bold',
          color: theme.colors.onSecondaryContainer,

      },
  });
