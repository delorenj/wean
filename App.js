import {NavigationContainer, DefaultTheme as DefaultNavTheme} from "@react-navigation/native";
import {Provider as PaperProvider, adaptNavigationTheme} from 'react-native-paper';
const { LightTheme } = adaptNavigationTheme({ reactNavigationLight: DefaultNavTheme });
import {Tabs} from "./components/tabs";
import {customTheme} from "./constants/colors";

export const App = () => {
  return (
      <PaperProvider theme={customTheme}>
        <NavigationContainer theme={LightTheme}>
          <Tabs />
        </NavigationContainer>
      </PaperProvider>
  );
}

export default App
