import {FirebaseProvider} from "./context/firebaseConfig";
import {SafeAreaProvider} from "react-native-safe-area-context";
import {ThemeProvider} from "./context/themeProvider";
import {ThemedApp} from "./ThemedApp";
import {DosesProvider} from "./context/dosesProvider";
import {DailyProvider} from "./context/dailyProvider";


export const App = () => {

    return (
        <FirebaseProvider>
            <ThemeProvider>
                <DailyProvider>
                    <DosesProvider>
                        <SafeAreaProvider>
                            <ThemedApp/>
                        </SafeAreaProvider>
                    </DosesProvider>
                </DailyProvider>
            </ThemeProvider>
        </FirebaseProvider>
    );
}

export default App
