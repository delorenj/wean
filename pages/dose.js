import {StyleSheet, Text, View} from "react-native";

export const DosePage = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Dose</Text>
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

export default DosePage;
