import {NavigationContainer} from "@react-navigation/native";
import { Provider as PaperProvider } from 'react-native-paper';
import {Tabs} from "./components/tabs";

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Tabs />
      </NavigationContainer>
    </PaperProvider>
  );
}
