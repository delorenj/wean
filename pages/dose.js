import {StyleSheet, Text, View} from "react-native";
import {useTheme} from "react-native-paper";
import {useMainStyles} from "../hooks/useMainStyles";
import {DoseForm} from "../components/DoseForm";

export const DosePage = () => {
  const theme = useTheme()
  const styles = useMainStyles(theme)
  return (
    <View style={styles.container}>
      <DoseForm   />
    </View>
  );
}
export default DosePage;
