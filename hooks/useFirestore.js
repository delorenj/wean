import { useEffect, useState } from 'react';
import firebase from 'firebase/app';
import {getFirestore} from 'firebase/firestore';

function useFirestore(collectionName) {
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    const unsubscribe = firebase
      .firestore()
      .collection(collectionName)
      .onSnapshot((snapshot) => {
        const updatedDocs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDocs(updatedDocs);
      });

    return () => unsubscribe();
  }, [collectionName]);

  const addDoc = async (data) => {
    const docRef = firebase.firestore().collection(collectionName).doc();
    await docRef.set(data);
  };

  const updateDoc = async (id, data) => {
    await firebase
      .firestore()
      .collection(collectionName)
      .doc(id)
      .update(data);
  };

  const deleteDoc = async (id) => {
    await firebase
      .firestore()
      .collection(collectionName)
      .doc(id)
      .delete();
  };

  return { docs, addDoc, updateDoc, deleteDoc };
}

export default useFirestore;
