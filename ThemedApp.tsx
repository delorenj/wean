import {
  NavigationContainer,
  DefaultTheme as DefaultNavTheme,
  DarkTheme as DarkNavTheme
} from "@react-navigation/native";

import useSettings from "./hooks/useSettings";
import {Tabs} from "./components/tabs";
import {useEffect, useState} from "react";
import {customTheme, customDarkTheme} from './constants/colors';
import {Provider as PaperProvider, adaptNavigationTheme} from 'react-native-paper';

const {LightTheme, DarkTheme} = adaptNavigationTheme({
  reactNavigationLight: DefaultNavTheme,
  reactNavigationDark: DarkNavTheme
});

export const ThemedApp = () => {
    const { settings } = useSettings();
    const [theme, setTheme] = useState<any>(customDarkTheme);

    useEffect(() => {
        setTheme(settings.darkMode ? customDarkTheme : customTheme)
    }, [settings])

    return (
        <PaperProvider theme={theme}>
            <NavigationContainer theme={theme}>
              <Tabs/>
            </NavigationContainer>
          </PaperProvider>
    )

}
