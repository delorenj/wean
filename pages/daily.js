import {ScrollView, View} from "react-native";
import {FAB, useTheme} from "react-native-paper";
import {useMainStyles} from "../hooks/useMainStyles";
import {useFirebase} from "../context/firebaseConfig";
import useFireauth from "../hooks/useFireauth";
import {SafeAreaView} from "react-native-safe-area-context";
import TimelineList from "../components/DailyDoseTimeline";

import {useState} from "react";
import {useNavigation} from "@react-navigation/native";

export const DailyPage = () => {
    const theme = useTheme()
    const styles = useMainStyles(theme)
    const {user} = useFireauth();
    const [showForm, setShowForm] = useState(false);
    const navigation = useNavigation();
    // Function to handle the onPress event of the FAB
    const handleAddDose = () => {
        // Logic to add a new dose to the timeline
        // setShowForm(true);
        navigation.navigate('Dose');
    };
    return (
        <SafeAreaView style={styles.safeAreaView}>
            {user && !showForm &&
                <TimelineList/>
            }
            {user && !showForm && (
                <FAB
                    visible={true}
                    icon='plus'
                    style={fabStyle}
                    onPress={handleAddDose}
                />
            )}
        </SafeAreaView>
    );
}
const styles = {
    safeAreaView: {
        flex: 1,
    },
    container: {
        flexGrow: 1,
    },

    sliderContainer: {
        position: 'absolute',
        bottom: 50, // You can adjust this value according to your needs
        width: '100%',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 10,
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
