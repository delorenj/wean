import { useEffect, useState } from 'react';
import { Model, ModelConverter } from '../models/Model';
import useFireauth, { FireauthType } from './useFireauth';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { useFirebase } from '../context/firebaseConfig';
import { startOfDay, endOfDay } from 'date-fns';
import { useDaily } from '../context/dailyProvider';
import { applyOptimisticDoseDelete, rollbackOptimisticDoseDelete } from './useDoses.helpers';

export interface Dose extends Model {
  id?: string;
  substance: string;
  amount: number;
  notes?: string;
  doseUnit: string;
  method?: string;
  date: Timestamp;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface DosesProviderType {
  doses: Dose[];
  addDose: (dose: Dose) => Promise<void>;
  updateDose: (doseId: string, updates: Partial<Dose>) => Promise<void>;
  deleteDose: (doseId: string) => Promise<void>;
  totalDoses: number;
  setCommonUnit: (unit: string) => void;
  commonUnit: string;
}

const dosesConverter: ModelConverter = {
  toFirestore: (dose: Dose) => {
    return {
      substance: dose.substance,
      amount: dose.amount,
      notes: dose.notes || '',
      doseUnit: dose.doseUnit,
      method: dose.method || '',
      date: dose.date,
      createdAt: dose.createdAt,
      updatedAt: dose.updatedAt,
    };
  },
  fromFirestore: (snapshot: any, options: any) => {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      substance: data.substance,
      amount: data.amount,
      notes: data.notes,
      doseUnit: data.doseUnit,
      method: data.method,
      date: data.date,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  },
};

const DOSE_UNIT_CONVERSIONS: { [unit: string]: number } = {
  g: 1,
  gram: 1,
  mg: 0.001,
  oz: 28.3495,
  ounce: 28.3495,
};

export const useDoses = (): DosesProviderType => {
  const [doses, setDoses] = useState<Dose[]>([]);
  const { user }: FireauthType = useFireauth();
  const { db } = useFirebase();
  const { selectedDate } = useDaily();
  const [totalDoses, setTotalDoses] = useState<number>(0);
  const [commonUnit, setCommonUnit] = useState<string>('g');

  useEffect(() => {
    if (!db || !user || !selectedDate) {
      setDoses([]);
      return;
    }

    const unsubscribe = getDosesByDate(selectedDate);

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, db, selectedDate]);

  const getDosesByDate = (date: Date): Unsubscribe | undefined => {
    if (!db || !user) {
      return undefined;
    }

    const dosesRef = collection(db, `doses-${user.uid}`).withConverter(dosesConverter);

    const startOfDay1 = Timestamp.fromDate(startOfDay(date));
    const endOfDay1 = Timestamp.fromDate(endOfDay(date));
    const dosesQuery = query(dosesRef, where('date', '>=', startOfDay1), where('date', '<=', endOfDay1));

    return onSnapshot(
      dosesQuery,
      (querySnapshot) => {
        const dosesData: Dose[] = [];
        querySnapshot.forEach((snapshotDoc) => {
          dosesData.push(snapshotDoc.data());
        });

        setDoses(dosesData);
      },
      (error) => {
        console.log('Failed to fetch doses:', error);
      }
    );
  };

  const addDose = async (dose: Dose): Promise<void> => {
    if (!user || !db) return;

    const createdAt = dose.createdAt || Timestamp.now();
    const doseId = dose.id || dose.date.seconds.toString();
    const ref = doc(db, `doses-${user.uid}`, doseId).withConverter(dosesConverter);

    const nextDose: Dose = {
      ...dose,
      id: doseId,
      notes: dose.notes || '',
      method: dose.method || '',
      createdAt,
      updatedAt: dose.updatedAt || createdAt,
    };

    try {
      await setDoc(ref, nextDose);
    } catch (error) {
      console.log(`There was an error pushing new dose to firestore with userId=${user.uid}`, error);
    }
  };

  const updateDose = async (doseId: string, updates: Partial<Dose>): Promise<void> => {
    if (!user || !db || !doseId) return;

    const ref = doc(db, `doses-${user.uid}`, doseId);

    const payload: Record<string, unknown> = {
      updatedAt: Timestamp.now(),
    };

    if (typeof updates.substance === 'string') {
      payload.substance = updates.substance;
    }

    if (typeof updates.amount === 'number') {
      payload.amount = updates.amount;
    }

    if (typeof updates.doseUnit === 'string') {
      payload.doseUnit = updates.doseUnit;
    }

    if ('notes' in updates) {
      payload.notes = updates.notes || '';
    }

    if ('method' in updates) {
      payload.method = updates.method || '';
    }

    if (updates.date) {
      payload.date = updates.date;
    }

    if (updates.createdAt) {
      payload.createdAt = updates.createdAt;
    }

    await updateDoc(ref, payload);
  };

  const deleteDose = async (doseId: string): Promise<void> => {
    if (!user || !db || !doseId) return;

    const snapshotBeforeDelete = doses;
    const optimisticResult = applyOptimisticDoseDelete(snapshotBeforeDelete, doseId);

    setDoses(optimisticResult.nextDoses);

    if (!optimisticResult.removedDose) {
      return;
    }

    const ref = doc(db, `doses-${user.uid}`, doseId);

    try {
      await deleteDoc(ref);
    } catch (error) {
      console.log(`There was an error deleting dose=${doseId} for userId=${user.uid}`, error);
      setDoses((current) =>
        rollbackOptimisticDoseDelete(current, optimisticResult.removedDose, optimisticResult.removedDoseIndex)
      );
    }
  };

  useEffect(() => {
    let total = 0;

    doses.forEach((dose) => {
      const conversionFactor = DOSE_UNIT_CONVERSIONS[dose.doseUnit];

      if (conversionFactor !== undefined) {
        total += dose.amount * conversionFactor;
      } else {
        console.warn(`Unknown dose unit: ${dose.doseUnit}`);
      }
    });

    const targetConversion = DOSE_UNIT_CONVERSIONS[commonUnit] || 1;
    setTotalDoses(total / targetConversion);
  }, [doses, commonUnit]);

  return { doses, addDose, updateDose, deleteDose, totalDoses, commonUnit, setCommonUnit };
};
