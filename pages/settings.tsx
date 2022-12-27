import {View} from "react-native";
import {useTheme, Text, Divider, List, Switch} from "react-native-paper";
import {useMainStyles} from "../hooks/useMainStyles";
import {SafeAreaView} from "react-native-safe-area-context";
import useSettings from "../hooks/useSettings";
import {SettingsProviderType} from "../hooks/useSettings";
import {useEffect} from "react";

export const SettingsPage = () => {
  const theme = useTheme()
  const styles = useMainStyles(theme)
  const { settings, toggleDarkMode }: SettingsProviderType = useSettings();
  useEffect(() => {

  }, [settings]);
  const isDarkModeOn = () => {
      return true
  }
  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text variant='headlineLarge' style={{padding: 20}}>Settings</Text>
        <Divider />
        <List.Section>
            <List.Item
                title="Dark Mode"
                left={() => (
                    <List.Icon icon="brightness-4" />
                )}
                right={() => (
                    <Switch trackColor={{ true: '#3498db', false: '#95a5a6' }} value={settings?.darkMode} onValueChange={toggleDarkMode}
                />
            )} />
        </List.Section>
      </View>
    </SafeAreaView>
  );
}

export default SettingsPage;
