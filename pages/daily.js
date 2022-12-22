import {StyleSheet, Text, View} from "react-native";
import {useTheme} from "react-native-paper";
import {useMainStyles} from "../hooks/useMainStyles";
import {useFirebase} from "../firebaseConfig";
import {useEffect} from "react";
import { collection, addDoc } from "firebase/firestore";

export const DailyPage = () => {
  const theme = useTheme()
  const styles = useMainStyles(theme)
  const {db} = useFirebase();

  useEffect(() => {
    const addData = async () => {
      try {
        const docRef = await addDoc(collection(db, "users"), {
          first: "Ada",
          last: "Lovelace",
          born: 1815,
        });
        console.log("Document written with ID: ", docRef.id);
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    };
    addData();
  }, [db, addDoc]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Daily</Text>
    </View>
  );
}

export default DailyPage;
