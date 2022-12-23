import {SectionList, StatusBar, StyleSheet, View} from "react-native";
import {Headline, Title, useTheme, Text, Divider, List, MD3Colors, Switch} from "react-native-paper";
import {useMemo} from "react";
import {useMainStyles} from "../hooks/useMainStyles";
import {SafeAreaView} from "react-native-safe-area-context";
import ListItem from "react-native-paper/lib/commonjs/components/List/ListItem";

export const SettingsPage = () => {
  const theme = useTheme()
  const styles = useMainStyles(theme)

 return (
    <SafeAreaView style={styles}>
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
                            <Switch
                trackColor={{ true: '#3498db', false: '#95a5a6' }}
            />
            )}>

            </List.Item>

        </List.Section>
      </View>
    </SafeAreaView>
  );
}

export default SettingsPage;
