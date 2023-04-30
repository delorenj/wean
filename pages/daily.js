import {ScrollView} from "react-native";
import {useTheme, FAB} from "react-native-paper";
import {useMainStyles} from "../hooks/useMainStyles";
import {useFirebase} from "../context/firebaseConfig";
import useFireauth from "../hooks/useFireauth";
import {SafeAreaView} from "react-native-safe-area-context";
import {DailyProvider} from "../context/dailyProvider";
import TimelineList from "../components/DailyDoseTimeline";

export const DailyPage = () => {
  const theme = useTheme()
  const styles = useMainStyles(theme)
  const {db} = useFirebase();
  const {user} = useFireauth();

  // Function to handle the onPress event of the FAB
  const handleAddDose = () => {
    // Logic to add a new dose to the timeline
    console.log('Add new dose');
  };
  return (
    <DailyProvider>
      <SafeAreaView style={styles.safeAreaView}>
        <ScrollView contentContainerStyle={styles.container}>
          {user &&
              <TimelineList />
          }
        </ScrollView>
                {user && (
          <FAB
            style={fabStyle}
            icon="plus"
            onPress={handleAddDose}
          />
        )}
      </SafeAreaView>
    </DailyProvider>
  );
}
const styles = {
  safeAreaView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
  },
};
const fabStyle = {
  position: 'absolute',
  margin: 16,
  right: 0,
  bottom: 0,
  borderRadius: 50,
};

export default DailyPage;
