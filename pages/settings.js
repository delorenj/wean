import {SectionList, StatusBar, StyleSheet, View} from "react-native";
import {Headline, Title, useTheme, Text, Divider} from "react-native-paper";
import {useMemo} from "react";
import {useMainStyles} from "../hooks/useMainStyles";
import {SafeAreaView} from "react-native-safe-area-context";

export const SettingsPage = () => {
  const theme = useTheme()
  const styles = useMainStyles(theme)

  const DATA = [
    {
      title: "Main dishes",
      data: ["Pizza", "Burger", "Risotto"]
    },
    {
      title: "Sides",
      data: ["French Fries", "Onion Rings", "Fried Shrimps"]
    },
    {
      title: "Drinks",
      data: ["Water", "Coke", "Beer"]
    },
    {
      title: "Desserts",
      data: ["Cheese Cake", "Ice Cream"]
    }
  ];

  const bstyles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: StatusBar.currentHeight,
      marginHorizontal: 16
    },
    item: {
      backgroundColor: "#f9c2ff",
      padding: 20,
      marginVertical: 8
    },
    header: {
      fontSize: 32,
      backgroundColor: "#fff"
    },
    title: {
      fontSize: 24
    }
  });

  return (
    <SafeAreaView style={styles}>
      <View>
        <Text variant='headlineLarge' style={{padding: 20}}>Settings</Text>
        <Divider />
        <SectionList style={bstyles}
          sections={DATA}
          keyExtractor={(item, index) => item + index}
          renderItem={({ item }) => <Text>Boo</Text>}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.header}>{title}</Text>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

export default SettingsPage;
