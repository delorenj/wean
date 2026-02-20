/**
 * Taper Settings Storage - Local Persistence
 * 
 * Manages user's taper configuration using AsyncStorage.
 * Separate from global settings (Firestore) to keep taper data local and fast.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@wean:taper_settings';

export interface TaperSettings {
  startDose: number;
  targetDose: number;
  durationDays: number;
  unit: string;
}

export const DEFAULT_TAPER_SETTINGS: TaperSettings = {
  startDose: 20,
  targetDose: 0,
  durationDays: 30,
  unit: 'g'
};

/**
 * Load taper settings from AsyncStorage
 * Returns defaults if not found or on error
 */
export async function loadTaperSettings(): Promise<TaperSettings> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return DEFAULT_TAPER_SETTINGS;
    }
    
    const parsed = JSON.parse(stored);
    
    // Validate and sanitize
    return {
      startDose: typeof parsed.startDose === 'number' && parsed.startDose >= 0 
        ? parsed.startDose 
        : DEFAULT_TAPER_SETTINGS.startDose,
      targetDose: typeof parsed.targetDose === 'number' && parsed.targetDose >= 0 
        ? parsed.targetDose 
        : DEFAULT_TAPER_SETTINGS.targetDose,
      durationDays: typeof parsed.durationDays === 'number' && parsed.durationDays >= 1 
        ? Math.floor(parsed.durationDays) 
        : DEFAULT_TAPER_SETTINGS.durationDays,
      unit: typeof parsed.unit === 'string' && parsed.unit.trim().length > 0 
        ? parsed.unit.trim() 
        : DEFAULT_TAPER_SETTINGS.unit
    };
  } catch (error) {
    console.error('Failed to load taper settings:', error);
    return DEFAULT_TAPER_SETTINGS;
  }
}

/**
 * Save taper settings to AsyncStorage
 */
export async function saveTaperSettings(settings: TaperSettings): Promise<void> {
  try {
    // Validate before saving
    if (settings.startDose < 0 || settings.targetDose < 0 || settings.durationDays < 1) {
      throw new Error('Invalid taper settings values');
    }
    
    if (settings.targetDose > settings.startDose) {
      throw new Error('Target dose cannot exceed start dose');
    }
    
    const sanitized: TaperSettings = {
      startDose: settings.startDose,
      targetDose: settings.targetDose,
      durationDays: Math.floor(settings.durationDays),
      unit: settings.unit.trim() || DEFAULT_TAPER_SETTINGS.unit
    };
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  } catch (error) {
    console.error('Failed to save taper settings:', error);
    throw error;
  }
}

/**
 * Clear taper settings (reset to defaults)
 */
export async function clearTaperSettings(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear taper settings:', error);
    throw error;
  }
}
