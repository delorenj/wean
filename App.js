import {
  NavigationContainer,
  DefaultTheme as DefaultNavTheme,
  DarkTheme as DarkNavTheme
} from "@react-navigation/native";
import {Provider as PaperProvider, adaptNavigationTheme, ActivityIndicator, MD3Colors} from 'react-native-paper';

const {LightTheme, DarkTheme} = adaptNavigationTheme({
  reactNavigationLight: DefaultNavTheme,
  reactNavigationDark: DarkNavTheme
});

import {Tabs} from "./components/tabs";
import {customTheme, customDarkTheme} from "./constants/colors";
import {FirebaseProvider} from "./context/firebaseConfig";
import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";
import {SettingsProvider} from "./context/settingsProvider";

export const App = () => {
  return (
    <FirebaseProvider>
      <SettingsProvider>
        <SafeAreaProvider>
          <PaperProvider theme={customDarkTheme}>
            <NavigationContainer theme={DarkTheme}>
              <Tabs/>
            </NavigationContainer>
          </PaperProvider>
        </SafeAreaProvider>
      </SettingsProvider>
    </FirebaseProvider>
  );
}

export default App
