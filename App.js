import {FirebaseProvider} from "./context/firebaseConfig";
import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";
import {SettingsProvider} from "./context/settingsProvider";
import {ThemedApp} from "./ThemedApp";
import {DosesProvider} from "./context/dosesProvider";
import {DailyProvider} from "./context/dailyProvider";


export const App = () => {

    return (
        <FirebaseProvider>
            <SettingsProvider>
                <DailyProvider>
                    <DosesProvider>
                        <SafeAreaProvider>
                            <ThemedApp/>
                        </SafeAreaProvider>
                    </DosesProvider>
                </DailyProvider>
            </SettingsProvider>
        </FirebaseProvider>
    );
}

export default App
