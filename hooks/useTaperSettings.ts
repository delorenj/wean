/**
 * useTaperSettings Hook
 * 
 * React hook for managing taper settings with local persistence
 */

import { useState, useEffect, useCallback } from 'react';
import {
  TaperSettings,
  DEFAULT_TAPER_SETTINGS,
  loadTaperSettings,
  saveTaperSettings
} from '../utils/taperSettings';

export interface UseTaperSettingsResult {
  settings: TaperSettings;
  isLoading: boolean;
  updateSettings: (settings: TaperSettings) => Promise<void>;
  resetSettings: () => Promise<void>;
}

export function useTaperSettings(): UseTaperSettingsResult {
  const [settings, setSettings] = useState<TaperSettings>(DEFAULT_TAPER_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    let mounted = true;
    
    loadTaperSettings()
      .then(loaded => {
        if (mounted) {
          setSettings(loaded);
          setIsLoading(false);
        }
      })
      .catch(err => {
        console.error('Failed to load taper settings:', err);
        if (mounted) {
          setIsLoading(false);
        }
      });
    
    return () => {
      mounted = false;
    };
  }, []);

  const updateSettings = useCallback(async (newSettings: TaperSettings) => {
    try {
      await saveTaperSettings(newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to update taper settings:', error);
      throw error;
    }
  }, []);

  const resetSettings = useCallback(async () => {
    try {
      await saveTaperSettings(DEFAULT_TAPER_SETTINGS);
      setSettings(DEFAULT_TAPER_SETTINGS);
    } catch (error) {
      console.error('Failed to reset taper settings:', error);
      throw error;
    }
  }, []);

  return {
    settings,
    isLoading,
    updateSettings,
    resetSettings
  };
}
