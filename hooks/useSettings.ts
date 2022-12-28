import { useEffect, useState } from 'react';
import {Model, ModelConverter} from '../models/Model';
import useFireauth, {FireauthType} from "./useFireauth";
import useFirestore from "./useFirestore";
import {collection, getDocs, query, where, onSnapshot, doc, setDoc, updateDoc} from "firebase/firestore";
import {useFirebase} from "../context/firebaseConfig";

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
    const [loaded, setLoaded] = useState<boolean>(false);
    const [dirty, setDirty] = useState<boolean>(false);
    const {user}: FireauthType = useFireauth();
    const {db} = useFirebase();

    // On page load
    // init settings object from db
    useEffect(() => {
        if (!user || !db || !setSettings) return;

    }, [user, db, setSettings])

    // On settings object updated
    // push new object to db
    useEffect(() => {
        if (!user || !db || !settings) return;
        console.log("PEEEEEN: " + JSON.stringify(db))
        const ref = doc(db, "settings", user.uid).withConverter(settingsConverter);
        setDoc(ref, settings)
            .then(r => {
                console.log("Yay! Set settings!")
            })
            .catch(e => {
                console.log("balls =( " + e.message)
            })
        
    }, [db, settings])

    const toggleDarkMode = () => {
        setSettings({...settings, darkMode:!settings.darkMode})
    }
    return { settings, toggleDarkMode };
}

export default useSettings;
