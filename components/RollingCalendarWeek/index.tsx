import {Card, Title, useTheme} from "react-native-paper";
import {SelectedDayTitle} from "./SelectedDayTitle";
import {DaySelectors} from "./DaySelectors";
import {useMainStyles} from "../../hooks/useMainStyles";

export const Index = () => {
    const theme = useTheme();
    const styles = useMainStyles(theme)
    return (
        <Card style={[styles.card, {flex: 0}]}>
            <Card.Content>
                <Title><SelectedDayTitle/></Title>
                <DaySelectors/>
            </Card.Content>
        </Card>
    );
};
