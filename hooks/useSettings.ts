import { useEffect, useState } from 'react';
import {Model, ModelConverter} from '../models/Model';
import useFireauth, {FireauthType} from "./useFireauth";
import useFirestore from "./useFirestore";
import {collection, getDocs, query, where, onSnapshot, doc, setDoc, updateDoc} from "firebase/firestore";

export interface SettingsProviderType {
    settings: Settings,
    toggleDarkMode
}

interface Settings extends Model {
    id: String,
    darkMode: boolean
}

const Settings = (id: String, darkMode: boolean): Settings => ({
    id,
    darkMode,
    toString() {
        return `${darkMode}`;
    },
});

const settingsConverter: ModelConverter = {
    toFirestore: (settings: Settings) => ({
        id: settings.id,
        darkMode: settings.darkMode,
    }),
    fromFirestore: (snapshot: any, options: any) => {
        const data = snapshot.data(options);
        return Settings(data.id, data.darkMode);
    },
};

const useSettings = (): SettingsProviderType => {
    const [settings, setSettings] = useState<Settings>({
        id: '',
        darkMode: true
    });
    const {user}: FireauthType = useFireauth();
    const {db} = useFirestore();

    useEffect(() => {
        if (!user || !db || !setSettings) return;
        const q = query(collection(db, 'settings'), where('userId', '==', user.uid)).withConverter(settingsConverter)
        const docs = getDocs(q)
            .then((snapshot) => {
                console.log(`Got user settings for user id=${user.uid}`);
                snapshot.forEach((doc) => {
                    console.log(doc.id, '=>', doc.data());
                })
            })
            .catch((e) => {
                console.log("oops")
            })
    }, [user, db, setSettings])

    useEffect(() => {
        if (!user || !db || !settings) return;
        updateDoc(settings)
    }, [settings])

    const toggleDarkMode = () => {
        setSettings({...settings, darkMode:!settings.darkMode})
    }
    return { settings, toggleDarkMode };
}

export default useSettings;
