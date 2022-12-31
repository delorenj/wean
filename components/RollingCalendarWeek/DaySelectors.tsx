import {Text, TouchableOpacity, View} from "react-native";
import { useRollingCalendarWeek } from "./Context";
import {useTheme} from "react-native-paper";

export const DaySelectors = () => {
    const theme = useTheme();
    const {selectedDate, setSelectedDate} = useRollingCalendarWeek();
    const currentDate = new Date();
    const styles = {
        button: {flex: 0.1, backgroundColor: 'white', borderRadius: 10, height: 65, },
        text: {textAlign: 'center', textTransform: 'uppercase'}
    }
    return (
        <View style={{padding:5, flexDirection: 'row', justifyContent: 'space-between'}}>
            <TouchableOpacity style={styles.button}>
                <Text style={styles.text}>Mon</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
                <Text style={styles.text}>Tue</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
                <Text style={styles.text}>Wed</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
                <Text style={styles.text}>Thu</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
                <Text style={styles.text}>Fri</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
                <Text style={styles.text}>Sat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
                <Text style={styles.text}>Sun</Text>
            </TouchableOpacity>
        </View>
    )
}
