import {useDaily} from "../../context/dailyProvider";
import {Card, List, MD3Colors, Title, useTheme} from "react-native-paper";
import {useMainStyles} from "../../hooks/useMainStyles";

export const DailyDoseTimeline = () => {
    const theme = useTheme();
    const styles = useMainStyles(theme);
    const {selectedDate} = useDaily();

    // @ts-ignore
    // @ts-ignore
    return (
  <List.Section>
    <List.Subheader>Some title</List.Subheader>
    <List.Item title="First Item" left={() => <List.Icon icon="folder" />} />
    <List.Item
      title="Second Item"
      left={() => <List.Icon color={MD3Colors.tertiary70} icon="folder" />}
    />
  </List.Section>
    )
}
