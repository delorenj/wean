import {StyleSheet, Text, View} from "react-native";
import {useTheme} from "react-native-paper";
import {useMainStyles} from "../hooks/useMainStyles";

export const PlanPage = () => {
  const theme = useTheme()
  const styles = useMainStyles(theme)
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Plan</Text>
    </View>
  );
}

export default PlanPage;
