import {Card, Paragraph, Title} from "react-native-paper";
import {SelectedDayTitle} from "./SelectedDayTitle";
import {useState} from "react";
import {DaySelectors} from "./DaySelectors";
import {RollingCalendarWeekProvider} from "./Context";

export const RollingCalendarWeek = () => {

    return (
        <RollingCalendarWeekProvider>
          <Card style={{flex: 0}}>
            <Card.Content>
              <Title><SelectedDayTitle /></Title>
              <DaySelectors />
            </Card.Content>
          </Card>
        </RollingCalendarWeekProvider>
    );
};
