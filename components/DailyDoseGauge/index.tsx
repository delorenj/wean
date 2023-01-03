import {useDaily} from "../../context/dailyProvider";
import {Card, Title, useTheme} from "react-native-paper";
import CircularProgress from "react-native-circular-progress-indicator";
import {useMainStyles} from "../../hooks/useMainStyles";

export const DailyDoseGauge = () => {
    const theme = useTheme();
    const styles = useMainStyles(theme);
    const {selectedDate} = useDaily();

    return (
        <Card style={ [styles.card, {flex: 0, justifyContent:'center', alignItems: 'center'}] }>
            <Title style={ { textAlign: 'center' as 'center', marginBottom: 10}}>Daily Dose</Title>
            <CircularProgress
              value={60}
              radius={120}
              progressValueColor={theme.colors.onSurface}
              activeStrokeColor={theme.colors.onPrimary}
              inActiveStrokeColor={theme.colors.primary}
              inActiveStrokeOpacity={0.5}
              inActiveStrokeWidth={30}
              activeStrokeWidth={20}
            />
        </Card>
    )
}
