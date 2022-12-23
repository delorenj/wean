import {StyleSheet, Text, View} from "react-native";
import {useTheme} from "react-native-paper";
import {useMainStyles} from "../hooks/useMainStyles";
import {useFirebase} from "../firebaseConfig";
import {useEffect} from "react";
import { collection, addDoc } from "firebase/firestore";
import useFireauth from "../hooks/useFireauth";

export const DailyPage = () => {
  const theme = useTheme()
  const styles = useMainStyles(theme)
  const {db} = useFirebase();
  const {user} = useFireauth();

  useEffect(() => {
    if(!user) return;
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
  }, [db, user, addDoc]);

  return (
    <View style={styles.container}>
      {user &&
        <Text style={styles.text}>{user.uid}</Text>
      }
      <Text style={styles.text}>Poopp</Text>
    </View>
  );
}

export default DailyPage;
