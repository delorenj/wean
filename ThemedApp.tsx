import {
  NavigationContainer,
  DefaultTheme as DefaultNavTheme,
  DarkTheme as DarkNavTheme
} from "@react-navigation/native";

import {
  MD3DarkTheme,
  MD3LightTheme,
} from 'react-native-paper';

import merge from 'deepmerge';
import useSettings from "./hooks/useSettings";
import {Tabs} from "./components/tabs";
import {useEffect, useState} from "react";
import {Provider as PaperProvider, adaptNavigationTheme} from 'react-native-paper';

const {LightTheme, DarkTheme} = adaptNavigationTheme({
  reactNavigationLight: DefaultNavTheme,
  reactNavigationDark: DarkNavTheme
});

const CombinedDefaultTheme = merge(MD3LightTheme, LightTheme);
const CombinedDarkTheme = merge(MD3DarkTheme, DarkTheme);

export const ThemedApp = () => {
    const { settings } = useSettings();
    const [theme, setTheme] = useState<any>(CombinedDarkTheme);

    useEffect(() => {
        setTheme(settings.darkMode ? CombinedDarkTheme : CombinedDefaultTheme)
    }, [settings])

    return (
        <PaperProvider theme={theme}>
            <NavigationContainer theme={theme}>
              <Tabs/>
            </NavigationContainer>
          </PaperProvider>
    )

}
