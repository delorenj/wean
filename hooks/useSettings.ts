import { useEffect, useState } from 'react';
import {Model, ModelConverter} from '../models/Model';
import useFireauth, {FireauthType} from "./useFireauth";
import {onSnapshot, doc, setDoc} from "firebase/firestore";
import {useFirebase} from "../context/firebaseConfig";

export interface SettingsProviderType {
    settings: Settings,
    toggleDarkMode
}

interface Settings extends Model {
    darkMode: boolean
}

const Settings = (darkMode: boolean = true): Settings => ({
    darkMode,
    toString() {
        return `${darkMode}`;
    },
});

const settingsConverter: ModelConverter = {
    toFirestore: (settings: Settings) => {
        console.log("to converter", settings);
        return {
            darkMode: settings.darkMode,
        }
    },
    fromFirestore: (snapshot: any, options: any) => {
        const data = snapshot.data(options);
        console.log("from converter", data)
        return Settings(data.darkMode);
    },
};

const useSettings = (): SettingsProviderType => {
    const [settings, setSettings] = useState<Settings>({
        darkMode: true
    });
    const {user}: FireauthType = useFireauth();
    const {db} = useFirebase();

    useEffect(() => {
        if(!db || !user) return;
            const unsub = onSnapshot(doc(db, "settings", user.uid).withConverter(settingsConverter), (doc) => {
                const source = doc.metadata.hasPendingWrites ? "Local" : "Server";
                console.log(source, " data: ", doc.data());
                if(!doc.data()) {
                    setSettings(Settings())
                } else {
                    setSettings(doc.data());
                }
            });
    }, [user, db]);

    // On settings object updated
    // push new object to db
    const sendSettingsToFirestore = newSettings =>  {
        if (!user || !db ) return;
        const ref = doc(db, "settings", user.uid).withConverter(settingsConverter);
        setDoc(ref, newSettings)
            .then(data => {
                console.log("Yay! Updated settings!")
            })
            .catch(e => {
                console.log(`There was an error pushing settings to firestore with userId=${user.uid}`)
            })

    }

    const toggleDarkMode = () => {
        const newSettings = {...settings, darkMode:!settings.darkMode};
        setSettings(newSettings)
        sendSettingsToFirestore(newSettings);
    }
    return { settings, toggleDarkMode };
}

export default useSettings;
