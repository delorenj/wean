import {FirebaseProvider} from "./context/firebaseConfig";
import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";
import {SettingsProvider} from "./context/settingsProvider";
import {ThemedApp} from "./ThemedApp";
import {DosesProvider} from "./context/dosesProvider";


export const App = () => {

  return (
    <FirebaseProvider>
      <SettingsProvider>
          <DosesProvider>
            <SafeAreaProvider>
              <ThemedApp/>
            </SafeAreaProvider>
          </DosesProvider>
      </SettingsProvider>
    </FirebaseProvider>
  );
}

export default App
