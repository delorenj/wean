import { useEffect, useState } from 'react';
import {Model, ModelConverter} from '../models/Model';
import useFireauth, {FireauthType} from "./useFireauth";
import { collection, query, where, onSnapshot, doc, setDoc} from "firebase/firestore";
import {useFirebase} from "../context/firebaseConfig";

export interface Dose extends Model {
  userId: string,
  substance: string,
  amount: number,
  timestamp: string,
  notes: string,
  doseUnit: string,
  method: string
}

export interface DosesProviderType {
  doses: Dose[],
  addDose: (dose: Dose) => void
}

const dosesConverter: ModelConverter = {
  toFirestore: (dose: Dose) => {
    return {
      userId: dose.userId,
      substance: dose.substance,
      amount: dose.amount,
      timestamp: dose.timestamp,
      notes: dose.notes,
      doseUnit: dose.doseUnit,
      method: dose.method
    }
  },
  fromFirestore: (snapshot: any, options: any) => {
    const data = snapshot.data(options);
    return {
      userId: data.userId,
      substance: data.substance,
      amount: data.amount,
      timestamp: data.timestamp,
      notes: data.notes,
      doseUnit: data.doseUnit,
      method: data.method
    }
  },
};

export const useDoses = (): DosesProviderType => {
  const [doses, setDoses] = useState<Dose[]>([]);
  const {user}: FireauthType = useFireauth();
  const {db} = useFirebase();

  useEffect(() => {
    if (!db || !user) return;
  console.log('User:', user);   // log user
  console.log('DB:', db);      // log database

    const dosesRef = collection(db, `doses-${user.uid}`).withConverter(dosesConverter);
    console.log('DosesRef:', dosesRef);   // log DosesRef

    const unsub = onSnapshot(dosesRef, (querySnapshot) => {
      console.log('onSnapshot triggered');   // log when onSnapshot triggers
      const dosesData = [];
      querySnapshot.forEach((doc) => {
        dosesData.push(doc.data());
      });
      setDoses(dosesData);
    });

    return unsub;
  }, [user, db]);

  const addDose = (dose: Dose) => {
    if (!user || !db ) return;
    const ref = doc(db, "doses", user.uid).withConverter(dosesConverter);
    setDoc(ref, dose)
      .then(data => {
        console.log("Yay! Added new dose!")
      })
      .catch(e => {
        console.log(`There was an error pushing new dose to firestore with userId=${user.uid}`)
      })
  }

  return { doses, addDose };
}
