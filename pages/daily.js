import {StyleSheet, Text, View} from "react-native";
import {useTheme} from "react-native-paper";

export const DailyPage = () => {
  const theme = useTheme()
  return (
    <View style={styles(theme).container}>
      <Text style={styles(theme).text}>Daily</Text>
    </View>
  );
}

const styles = theme => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: theme.colors.white
  }
});

export default DailyPage;
