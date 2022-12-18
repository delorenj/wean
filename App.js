import {NavigationContainer, DefaultTheme as DefaultNavTheme, DarkTheme as DarkNavTheme} from "@react-navigation/native";
import {Provider as PaperProvider, adaptNavigationTheme} from 'react-native-paper';
const { LightTheme, DarkTheme } = adaptNavigationTheme({ reactNavigationLight: DefaultNavTheme, reactNavigationDark: DarkNavTheme });

import {Tabs} from "./components/tabs";
import {customTheme, customDarkTheme} from "./constants/colors";

export const App = () => {
  return (
      <PaperProvider theme={customDarkTheme}>
        <NavigationContainer theme={DarkTheme}>
          <Tabs />
        </NavigationContainer>
      </PaperProvider>
  );
}

export default App
