import {StyleSheet, Text, View} from "react-native";

export const PlanPage = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Plan</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#58BC82',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff'
  }
});

export default PlanPage;
