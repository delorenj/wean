import {NavigationContainer, DefaultTheme as DefaultNavTheme, DarkTheme as DarkNavTheme} from "@react-navigation/native";
import {Provider as PaperProvider, adaptNavigationTheme, ActivityIndicator, MD3Colors} from 'react-native-paper';
const { LightTheme, DarkTheme } = adaptNavigationTheme({ reactNavigationLight: DefaultNavTheme, reactNavigationDark: DarkNavTheme });

import {Tabs} from "./components/tabs";
import {customTheme, customDarkTheme} from "./constants/colors";
import {RealmContext} from "./hooks/useRealmContext";

export const App = () => {
  const syncConfig = {
    user: app?.currentUser,
    partitionValue: 'ExpoTemplate',
  };

  return (
    <RealmContext sync={syncConfig} fallback={() => <ActivityIndicator animating={true} color={MD3Colors.error0} />} >
      <PaperProvider theme={customDarkTheme}>
        <NavigationContainer theme={DarkTheme}>
          <Tabs />
        </NavigationContainer>
      </PaperProvider>
    </RealmContext>
  );
}

export default App
