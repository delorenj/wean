import {View} from "react-native";
import {useTheme, Text, MD3Colors} from "react-native-paper";
import {useMainStyles} from "../hooks/useMainStyles";
import {useFirebase} from "../context/firebaseConfig";
import useFireauth from "../hooks/useFireauth";
import {SafeAreaView} from "react-native-safe-area-context";
import {Index as RollingCalendarWeek} from "../components/RollingCalendarWeek";
import {DailyProvider} from "../context/dailyProvider";
import {DailyDoseGauge} from "../components/DailyDoseGauge";

export const DailyPage = () => {
  const theme = useTheme()
  const styles = useMainStyles(theme)
  const {db} = useFirebase();
  const {user} = useFireauth();

  return (
    <DailyProvider>
      <SafeAreaView>
        <View style={styles.container}>
          {user &&
            <RollingCalendarWeek />
          }
          {user &&
            <DailyDoseGauge />
          }
        </View>
      </SafeAreaView>
    </DailyProvider>
  );
}

export default DailyPage;
