import {useEffect, useState} from 'react';
import {Model, ModelConverter} from '../models/Model';
import useFireauth, {FireauthType} from "./useFireauth";
import {collection, query, where, onSnapshot, doc, setDoc, getDocs} from "firebase/firestore";
import {useFirebase} from "../context/firebaseConfig";
import {startOfDay, endOfDay} from 'date-fns';
import {useDaily} from "../context/dailyProvider";
import {Timestamp} from "firebase/firestore";

export interface Dose extends Model {
    substance: string,
    amount: number,
    notes?: string,
    doseUnit: string,
    method?: string,
    date: Timestamp
}

export interface DoseTotalByDate {
    date: Date,
    total: number
}

export interface DosesProviderType {
    doses: Dose[],
    addDose: (dose: Dose) => void,
    totalDoses: number,
    setCommonUnit: (unit: string) => void,
    commonUnit: string,
    getDosesBetweenDates: (startDate: Date, endDate: Date) => Promise<any>
}

const dosesConverter: ModelConverter = {
    toFirestore: (dose: Dose) => {
        return {
            substance: dose.substance,
            amount: dose.amount,
            notes: dose.notes || '',
            doseUnit: dose.doseUnit,
            method: dose.method || '',
            date: dose.date
        }
    },
    fromFirestore: (snapshot: any, options: any) => {
        const data = snapshot.data(options);
        return {
            substance: data.substance,
            amount: data.amount,
            notes: data.notes,
            doseUnit: data.doseUnit,
            method: data.method,
            date: data.date
        }
    },
};

export const useDoses = (): DosesProviderType => {
    const [doses, setDoses] = useState<Dose[]>([]);
    const {user}: FireauthType = useFireauth();
    const {db} = useFirebase();
    const {selectedDate} = useDaily();
    const [totalDoses, setTotalDoses] = useState<number>(0);
    const [commonUnit, setCommonUnit] = useState<string>('g');

    useEffect(() => {
        if (!db || !user || !selectedDate) return;
        getDosesByDate(selectedDate);
    }, [user, db, selectedDate]);

    const getDaysArray = (start, end) => {
        let arr = [];
        for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
            arr.push(new Date(dt));
        }
        return arr;
    };

    const getDosesBetweenDates = async (startDate, endDate) => {
        const datesArray = getDaysArray(startDate, endDate);
        const dosesRef = collection(db, `doses-${user.uid}`).withConverter(dosesConverter);
        let dosesDataByDate:DoseTotalByDate[] = [];

        for (let i = 0; i < datesArray.length; i++) {
            const date = datesArray[i];
            const startOfDay1 = Timestamp.fromDate(startOfDay(date));
            const endOfDay1 = Timestamp.fromDate(endOfDay(date));

            const dosesQuery = query(dosesRef, where("date", ">=", startOfDay1), where("date", "<=", endOfDay1));

            await getDocs(dosesQuery).then((querySnapshot) => {
                let dosesData = [];
                querySnapshot.forEach((doc) => {
                    dosesData.push(doc.data());
                });
                dosesDataByDate.push({date: date, total: dosesData.map(dose => dose.amount).reduce((a, b) => a + b, 0)});
            });
        }
        return dosesDataByDate;
    }

    const getDosesByDate = date => {
        const dosesRef = collection(db, `doses-${user.uid}`).withConverter(dosesConverter);
        console.log('DosesRef:', dosesRef);   // log DosesRef

        // Get today's start and end time
        const startOfDay1 = Timestamp.fromDate(startOfDay(date))
        const endOfDay1 = Timestamp.fromDate(endOfDay(date))
        console.log('startOfDay1:', startOfDay1);   // log startOfDay1
        console.log('endOfDay1:', endOfDay1);   // log endOfDay1
        // Modify query to only fetch documents within today's date range
        const dosesQuery = query(dosesRef, where("date", ">=", startOfDay1), where("date", "<=", endOfDay1));

        onSnapshot(dosesQuery, (querySnapshot) => {
            console.log('onSnapshot triggered');   // log when onSnapshot triggers
            const dosesData = [];
            querySnapshot.forEach((doc) => {
                dosesData.push(doc.data());
            });
            console.log('dosesData:', dosesData);   // log dosesData
            setDoses(dosesData);
        });
    }
    const addDose = (dose: Dose) => {
        if (!user || !db) return;
        const ref = doc(db, `doses-${user.uid}`, dose.date.seconds.toString()).withConverter(dosesConverter);
        setDoc(ref, dose)
            .then(data => {
                console.log("Yay! Added new dose!: userId=", user.uid, "dose=", dose)
            })
            .catch(e => {
                console.log(`There was an error pushing new dose to firestore with userId=${user.uid}`)
            })
    }

    const doseUnitConversions: { [unit: string]: number } = {
        'g': 1,
        'gram': 1,
        'oz': 28.3495,
        'ounce': 28.3495, // This is how many grams are in one ounce
        // add any other units here, indicating how many grams they correspond to
    };

    useEffect(() => {
        let total = 0;
        doses.forEach(dose => {
            const conversionFactor = doseUnitConversions[dose.doseUnit];
            if (conversionFactor !== undefined) {
                total += dose.amount * conversionFactor;
            } else {
                console.warn(`Unknown dose unit: ${dose.doseUnit}`);
            }
        });

        setTotalDoses(total / doseUnitConversions[commonUnit]);  // convert total to the common unit
    }, [doses, doseUnitConversions, setTotalDoses, commonUnit]);


    return {doses, addDose, totalDoses, commonUnit, setCommonUnit, getDosesBetweenDates};
}
