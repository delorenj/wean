import {StyleSheet, Text, View} from "react-native";
import {useTheme} from "react-native-paper";
import {useMainStyles} from "../hooks/useMainStyles";
import Last7DaysGraph from "../components/Graphs/Last7DaysGraph";

export const InsightsPage = () => {
  const theme = useTheme()
  const styles = useMainStyles(theme)
  return (
    <View style={styles.container}>
      <Last7DaysGraph />
    </View>
  );
}

export default InsightsPage;
