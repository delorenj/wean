import {StyleSheet, Text, View} from "react-native";
import {useTheme} from "react-native-paper";
import {useMemo} from "react";
import {useMainStyles} from "../hooks/useMainStyles";

export const SettingsPage = () => {
  const theme = useTheme()
  const styles = useMainStyles(theme)
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Settings</Text>
    </View>
  );
}

export default SettingsPage;
