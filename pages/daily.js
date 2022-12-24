import {StyleSheet, View} from "react-native";
import {useTheme, Text} from "react-native-paper";
import {useMainStyles} from "../hooks/useMainStyles";
import {useFirebase} from "../context/firebaseConfig";
import {useEffect} from "react";
import { collection, addDoc } from "firebase/firestore";
import useFireauth from "../hooks/useFireauth";
import {SafeAreaView} from "react-native-safe-area-context";

export const DailyPage = () => {
  const theme = useTheme()
  const styles = useMainStyles(theme)
  const {db} = useFirebase();
  const {user} = useFireauth();

  // useEffect(() => {
  //   if(!user) return;
  //   const addData = async () => {
  //     try {
  //       const docRef = await addDoc(collection(db, "users"), {
  //         first: "Ada",
  //         last: "Lovelace",
  //         born: 1815,
  //       });
  //       console.log("Document written with ID: ", docRef.id);
  //     } catch (e) {
  //       console.error("Error adding document: ", e);
  //     }
  //   };
  //   addData();
  // }, [db, user, addDoc]);

  return (
    <SafeAreaView>
      <View style={styles}>
        {user &&
          <Text variant='bodyMedium'>{user.uid}</Text>
        }
        <Text variant='headlineMedium'>Poopp</Text>
      </View>
    </SafeAreaView>
  );
}

export default DailyPage;
