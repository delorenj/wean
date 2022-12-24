import {SectionList, StatusBar, StyleSheet, View} from "react-native";
import {Headline, Title, useTheme, Text, Divider} from "react-native-paper";
import {useMemo} from "react";
import {useMainStyles} from "../hooks/useMainStyles";
import {SafeAreaView} from "react-native-safe-area-context";

export const SettingsPage = () => {
  const theme = useTheme()
  const styles = useMainStyles(theme)
  const { docs } = useSettings()
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
