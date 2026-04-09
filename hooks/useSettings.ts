import { useCallback, useEffect, useRef, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import useFireauth from './useFireauth';
import { useFirebase } from '../context/firebaseConfig';
import {
  DEFAULT_SETTINGS,
  DoseUnitPreference,
  mergeSettings,
  normalizeSettings,
  Settings,
  SortOrderPreference,
  ThemePreference,
  toSettingsDocument,
} from './useSettings.helpers';

export interface SettingsProviderType {
  settings: Settings;
  isLoading: boolean;
  setThemePreference: (theme: ThemePreference) => Promise<void>;
  toggleThemePreference: () => Promise<void>;
  setDefaultDoseUnit: (doseUnit: DoseUnitPreference) => Promise<void>;
  setSortOrder: (sortOrder: SortOrderPreference) => Promise<void>;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
}

const useSettings = (): SettingsProviderType => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const settingsRef = useRef<Settings>(DEFAULT_SETTINGS);
  const { user } = useFireauth();
  const { db } = useFirebase();

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    if (!db || !user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const settingsDocRef = doc(db, 'settings', user.uid);

    const unsubscribe = onSnapshot(
      settingsDocRef,
      (snapshot) => {
        const normalizedSettings = normalizeSettings(snapshot.data());
        settingsRef.current = normalizedSettings;
        setSettings(normalizedSettings);
        setIsLoading(false);
      },
      (error) => {
        console.error('Failed to read user settings:', error);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [db, user]);

  const persistSettings = useCallback(async (nextSettings: Settings) => {
    if (!db || !user) {
      return;
    }

    const settingsDocRef = doc(db, 'settings', user.uid);
    await setDoc(settingsDocRef, toSettingsDocument(nextSettings), { merge: true });
  }, [db, user]);

  const updateSettings = useCallback(async (updates: Partial<Settings>) => {
    const nextSettings = mergeSettings(settingsRef.current, updates);
    settingsRef.current = nextSettings;
    setSettings(nextSettings);

    try {
      await persistSettings(nextSettings);
    } catch (error) {
      console.error('Failed to update user settings:', error);
    }
  }, [persistSettings]);

  const setThemePreference = useCallback(async (theme: ThemePreference) => {
    await updateSettings({ theme });
  }, [updateSettings]);

  const toggleThemePreference = useCallback(async () => {
    await updateSettings({
      theme: settingsRef.current.theme === 'dark' ? 'light' : 'dark',
    });
  }, [updateSettings]);

  const setDefaultDoseUnit = useCallback(async (doseUnit: DoseUnitPreference) => {
    await updateSettings({ defaultDoseUnit: doseUnit });
  }, [updateSettings]);

  const setSortOrder = useCallback(async (sortOrder: SortOrderPreference) => {
    await updateSettings({ sortOrder });
  }, [updateSettings]);

  const setNotificationsEnabled = useCallback(async (enabled: boolean) => {
    await updateSettings({ notificationsEnabled: enabled });
  }, [updateSettings]);

  return {
    settings,
    isLoading,
    setThemePreference,
    toggleThemePreference,
    setDefaultDoseUnit,
    setSortOrder,
    setNotificationsEnabled,
    updateSettings,
  };
};

export default useSettings;
