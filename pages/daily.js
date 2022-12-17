import {StyleSheet, Text, View} from "react-native";
import {useTheme} from "react-native-paper";

export const DailyPage = props => {
  const theme = useTheme()
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Daily</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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

export default withTheme(DailyPage);
