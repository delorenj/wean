import {Text, TouchableOpacity, View} from "react-native";
import { useRollingCalendarWeek } from "./Context";
import {Card, useTheme} from "react-native-paper";

export const DaySelectors = () => {
    const theme = useTheme();
    const {selectedDate, setSelectedDate} = useRollingCalendarWeek();
    const currentDate = new Date();
    const styles = {
        button: {
            flex: 0.1,
            justifyContent: 'space-between' as 'space-between',
            backgroundColor: theme.colors.secondaryContainer,
            borderRadius: 10,
            height: 75,
            padding: 5,

        },
        numCard: {
            flex: 0,
            alignSelf: 'center' as 'center'
            padding: 10
        },
        dayName: {
            textAlign: 'center' as 'center',
            alignSelf: 'center' as 'center'
        },
        text: {
            textTransform: 'uppercase' as 'uppercase',
            color: theme.colors.secondary,
            fontSize: 10,
            fontWeight: 'bold' as 'bold'
        },
    }
    return (
        <View style={{padding:5, flexDirection: 'row', justifyContent: 'space-between'}}>
            <TouchableOpacity style={styles.button}>
                <Text style={[styles.dayName, styles.text]}>Mon</Text>
                <Card style={styles.numCard}><Text style={styles.text}>3</Text></Card>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
                <Text style={[styles.dayName, styles.text]}>Tue</Text>
                <Card style={styles.numCard}><Text style={styles.text}>4</Text></Card>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
                <Text style={[styles.dayName, styles.text]}>Wed</Text>
                <Card style={styles.numCard}><Text style={styles.text}>5</Text></Card>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
                <Text style={[styles.dayName, styles.text]}>Thu</Text>
                <Card style={styles.numCard}><Text style={styles.text}>6</Text></Card>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
                <Text style={[styles.dayName, styles.text]}>Fri</Text>
                <Card style={styles.numCard}><Text style={styles.text}>7</Text></Card>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
                <Text style={[styles.dayName, styles.text]}>Sat</Text>
                <Card style={styles.numCard}><Text style={styles.text}>8</Text></Card>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
                <Text style={[styles.dayName, styles.text]}>Sun</Text>
                <Card style={styles.numCard}><Text style={styles.text}>9</Text></Card>
            </TouchableOpacity>
        </View>
    )
}
