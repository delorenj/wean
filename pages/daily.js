import {ScrollView} from "react-native";
import {useTheme, FAB} from "react-native-paper";
import {useMainStyles} from "../hooks/useMainStyles";
import {useFirebase} from "../context/firebaseConfig";
import useFireauth from "../hooks/useFireauth";
import {SafeAreaView} from "react-native-safe-area-context";
import {DailyProvider} from "../context/dailyProvider";
import TimelineList from "../components/DailyDoseTimeline";
import {useState} from "react";

export const DailyPage = () => {
  const theme = useTheme()
  const styles = useMainStyles(theme)
  const {db} = useFirebase();
  const {user} = useFireauth();
  const [fabState, setFabState] = useState({ open: false });

  const onFabStateChange = ({ open }) => setFabState({ open });

  const { open } = fabState;
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
        <FAB.Group
          open={open}
          visible
          icon={open ? 'plus' : 'plus'}
          actions={[
            { icon: 'plus', onPress: () => console.log('Pressed add') },
            {
              icon: 'leaf',
              label: 'Kratom',
              onPress: () => console.log('Pressed Kratom'),
            },
            {
              icon: 'cigar',
              label: 'Cigarette',
              onPress: () => console.log('Pressed cigarette'),
            },
            {
              icon: 'coffee',
              label: 'Coffee',
              onPress: () => console.log('Pressed coffee'),
            },
          ]}
          onStateChange={onFabStateChange}
          onPress={() => {
            if (open) {
              // do something if the speed dial is open
            }
          }}
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
