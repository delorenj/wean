import { useEffect, useState } from 'react';
import {Model, ModelConverter} from '../models/Model';
import useFireauth, {FireauthType} from "./useFireauth";
import useFirestore from "./useFirestore";

export interface SettingsProviderType {
    settings: Settings
}

interface Settings extends Model {
    darkMode: boolean
}

const Settings = (darkMode: boolean): Settings => ({
    darkMode,
    toString() {
        return `${darkMode}`;
    },
});

const settingsConverter: ModelConverter = {
    toFirestore: (settings: Settings) => ({
        darkMode: settings.darkMode,
    }),
    fromFirestore: (snapshot: any, options: any) => {
        const data = snapshot.data(options);
        return Settings(data.darkMode);
    },
};

const useSettings = (): SettingsProviderType => {
    const [settings, setSettings] = useState<Settings>({
        darkMode: true
    });
    const {user}: FireauthType = useFireauth();
    const {db} = useFirestore();

    useEffect(() => {
        if (!user || !db || !setSettings) return;

        db.collection('settings')
            .where('userId', '==', user.uid)
            .then((snapshot) => {
                console.log(`Got user settings for user id=${user.uid}`)
                snapshot.forEach((doc) => {
                    console.log(doc.id, '=>', doc.data());
                    setSettings(doc);
                });
            })
            .catch((e) => {
                console.log(`Error looking up user settings: ${e.message}`)
            })
    }, [user, db, setSettings]);

    return { settings };
}

export default useSettings;
