import {Card, Title} from "react-native-paper";
import {SelectedDayTitle} from "./SelectedDayTitle";
import {DaySelectors} from "./DaySelectors";

export const Index = () => {
    return (
        <Card style={{flex: 0}}>
            <Card.Content>
                <Title><SelectedDayTitle/></Title>
                <DaySelectors/>
            </Card.Content>
        </Card>
    );
};
