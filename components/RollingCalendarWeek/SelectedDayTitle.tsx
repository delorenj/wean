import {Text} from "react-native";
import {useMemo, useState} from "react";
import {useDaily} from "../../context/dailyProvider";

export const SelectedDayTitle = () => {
    const {selectedDate} = useDaily();
    const currentDate = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const [dateToDisplay, setDateToDisplay] = useState<Date>(selectedDate || currentDate);

    const textToDisplay = useMemo(() => {
        console.log(dateToDisplay);
        const year = dateToDisplay.getFullYear();
        const month = dateToDisplay.getMonth();
        const day = dateToDisplay.getDate();
        let prefix = '';
        if(dateToDisplay.getDate() == currentDate.getDate()) {
            prefix = 'Today, ';
        } else {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (dateToDisplay.getDate() == yesterday.getDate()) {
                prefix = 'Yesterday, ';
            }
        }
        return `${prefix}${day} ${months[month]} ${year}`
    }, [dateToDisplay]);


    return (
        <Text>{textToDisplay}</Text>
    )
}
