import {NavigationContainer} from "@react-navigation/native";
import { Provider as PaperProvider, ThemeProvider } from 'react-native-paper';
import {Tabs} from "./components/tabs";
import {mainTheme} from "./constants/colors";
export const App = () => {
  return (
    <ThemeProvider theme={mainTheme}>
      <PaperProvider>
        <NavigationContainer>
          <Tabs />
        </NavigationContainer>
      </PaperProvider>
    </ThemeProvider>
  );
}

export default App
