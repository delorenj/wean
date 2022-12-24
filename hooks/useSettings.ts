import { useEffect, useState } from 'react';
import useFireauth, {FireauthType} from "./useFireauth";
import useFirestore from "./useFirestore";

export interface SettingsType {
    darkMode: boolean
}
export interface SettingsProviderType {
    settings: SettingsType
}

const useSettings = () : SettingsProviderType => {
  const [settings, setSettings] = useState<SettingsType>({
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
