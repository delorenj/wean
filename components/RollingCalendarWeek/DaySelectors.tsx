/*
This code defines a React Native component called DaySelectors that allows users to select a day of the week from a list of seven days (three days before the current date, the current date, and three days after the current date). Each day is displayed as a button, and the currently selected day is highlighted with a different background color.

Let's go through the code in detail:

The required modules and components are imported, including Text, TouchableOpacity, View from react-native, Card, useTheme from react-native-paper, useCallback, useMemo from react, and useDaily from the application's context provider.

The DaySelectors component is defined as a functional component:

The theme object is retrieved using the useTheme hook from react-native-paper, which provides access to the current theme.
The selectedDate and setSelectedDate values are retrieved from the application's context provider using the useDaily hook.
The currentDate is set to the current date using the JavaScript Date object.
The array daysOfWeek contains the abbreviated names of the days of the week.
An empty array dayButtons is defined to store the buttons for the seven days.

A loop runs from -3 to 3, where each iteration represents one of the seven days:

dayDate is set to the date of the day being processed.
dayName is set to the abbreviated name of the day based on the index of the daysOfWeek array.
dayDay is set to the numeric day of the month.
The useMemo hook is used to memoize the styles that depend on theme, dayDate, and selectedDate using the getStyles function.
A TouchableOpacity component is created for each day, with an onPress event handler to update the selectedDate with the current dayDate.
The abbreviated day name and numeric day are displayed within the button.
The day button is added to the dayButtons array.
The DaySelectors component returns a View component that contains the dayButtons array. The View component has styles for padding, flexDirection, and justifyContent.

The getStyles function is defined to generate styles for the day buttons. The styles are based on the theme and the selected date.

In summary, the DaySelectors component creates a row of seven buttons that represent the days of the week centered around the current date. Users can select a day by tapping on the button, and the selected day is highlighted with a different background color.
 */

import {Text, TouchableOpacity, View} from "react-native";
import {Card, useTheme} from "react-native-paper";
import {useCallback, useMemo} from "react";
import {useDaily} from "../../context/dailyProvider";

export const DaySelectors = () => {
  const theme = useTheme();
  const {selectedDate, setSelectedDate} = useDaily();
  const currentDate = new Date();
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
      <TouchableOpacity style={styles.button} onPress={() => setSelectedDate(dayDate)}>
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
