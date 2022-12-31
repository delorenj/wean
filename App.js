

import {FirebaseProvider} from "./context/firebaseConfig";
import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";
import {SettingsProvider} from "./context/settingsProvider";
import {ThemedApp} from "./ThemedApp";


export const App = () => {

  return (
    <FirebaseProvider>
      <SettingsProvider>
        <SafeAreaProvider>
          <ThemedApp/>
        </SafeAreaProvider>
      </SettingsProvider>
    </FirebaseProvider>
  );
}

export default App
