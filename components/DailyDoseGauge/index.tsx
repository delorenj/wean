import {useDaily} from "../../context/dailyProvider";
import {Card} from "react-native-paper";
import CircularProgress from "react-native-circular-progress-indicator";

export const DailyDoseGauge = () => {
    const {selectedDate} = useDaily();

    return (
        <Card>
            <CircularProgress
              value={60}
              radius={120}
              duration={2000}
              progressValueColor={'#ecf0f1'}
              maxValue={200}
              title={'KM/H'}
              titleColor={'white'}
              titleStyle={{fontWeight: 'bold'}}
            />
        </Card>
    )
}
