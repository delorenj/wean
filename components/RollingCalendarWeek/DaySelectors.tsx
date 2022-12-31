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
            backgroundColor: theme.colors.secondaryContainer,
            borderRadius: 10,
            height: 75,
            padding: 5
        },
        text: {
            textAlign: 'center',
            textTransform: 'uppercase',
            color: theme.colors.secondary,
            fontSize: 10,
            fontWeight: "bold"
        },
        numCard: {
            marginTop: 10,
            flex: 0.8,
            flexDirection: "column",
            alignItems: "stretch",
            justifyContent: "center"
        }
    }
    return (
        <View style={{padding:5, flexDirection: 'row', justifyContent: 'space-between'}}>
            <TouchableOpacity style={styles.button}>
                <Text style={styles.text}>Mon</Text>
                <Card style={styles.numCard}><Text style={styles.text}>3</Text></Card>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
                <Text style={styles.text}>Tue</Text>
                <Card style={styles.numCard}><Text style={styles.text}>4</Text></Card>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
                <Text style={styles.text}>Wed</Text>
                <Card style={styles.numCard}><Text style={styles.text}>5</Text></Card>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
                <Text style={styles.text}>Thu</Text>
                <Card style={styles.numCard}><Text style={styles.text}>6</Text></Card>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
                <Text style={styles.text}>Fri</Text>
                <Card style={styles.numCard}><Text style={styles.text}>7</Text></Card>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
                <Text style={styles.text}>Sat</Text>
                <Card style={styles.numCard}><Text style={styles.text}>8</Text></Card>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
                <Text style={styles.text}>Sun</Text>
                <Card style={styles.numCard}><Text style={styles.text}>9</Text></Card>
            </TouchableOpacity>
        </View>
    )
}
