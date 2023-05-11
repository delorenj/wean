import { useEffect, useState } from 'react';
import {Model, ModelConverter} from '../models/Model';
import useFireauth, {FireauthType} from "./useFireauth";
import {onSnapshot, doc, setDoc} from "firebase/firestore";
import {useFirebase} from "../context/firebaseConfig";

export interface DosesProviderType {
    doses: Doses,
}

interface Dose extends Model {
    amount: number,
    doseUnit: string,
    method: string,
    notes: string,
    substance: string,
}
interface Doses {
    [timestamp: number]: Dose;
}

const Doses = (data): Doses => ({

});

const dosesConverter: ModelConverter = {
    toFirestore: (doses: Doses) => {
        console.log("to converter", doses);
        return doses;
    },
    fromFirestore: (snapshot: any, options: any) => {
        const data = snapshot.data(options);
        console.log("from converter", data)
        return Doses(data);
    },
};

const useDoses = (): DosesProviderType => {
    const [doses, setDoses] = useState<Doses>({});
    const {user}: FireauthType = useFireauth();
    const {db} = useFirebase();

    useEffect(() => {
        if(!db || !user) return;
            const unsub = onSnapshot(doc(db, "doses-"+user.uid, user.uid).withConverter(dosesConverter), (doc) => {
                const source = doc.metadata.hasPendingWrites ? "Local" : "Server";
                console.log(source, " data: ", doc.data());
                if(!doc.data()) {
                    setDoses({})
                } else {
                    setDoses(doc.data());
                }
            });
    }, [user, db]);

    // On doses object updated
    // push new object to db
    const sendDosesToFirestore = newDoses =>  {
        if (!user || !db ) return;
        const ref = doc(db, "doses", user.uid).withConverter(dosesConverter);
        setDoc(ref, newDoses)
            .then(data => {
                console.log("Yay! Updated doses!")
            })
            .catch(e => {
                console.log(`There was an error pushing doses to firestore with userId=${user.uid}`)
            })

    }
    
    return { doses };
}

export default useDoses;
