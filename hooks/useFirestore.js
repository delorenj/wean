import {useFirebase} from "../context/firebaseConfig";

function useFirestore(collectionName) {
  const {db} = useFirebase();
  return { db };
}

export default useFirestore;
