import React, { createContext, useContext, useMemo } from 'react';
import {
  DefaultTheme as DefaultNavTheme,
  DarkTheme as DarkNavTheme,
} from '@react-navigation/native';
import {
  MD3DarkTheme,
  MD3LightTheme,
  adaptNavigationTheme,
} from 'react-native-paper';
import merge from 'deepmerge';
import useSettings, { SettingsProviderType } from '../hooks/useSettings';
import { createPaperTheme as buildPaperTheme } from '../src/theme';

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: DefaultNavTheme,
  reactNavigationDark: DarkNavTheme,
});

const CombinedDefaultTheme = merge(MD3LightTheme, LightTheme);
const CombinedDarkTheme = merge(MD3DarkTheme, DarkTheme);

interface AppThemeContextType extends SettingsProviderType {
  isDark: boolean;
  statusBarStyle: 'light' | 'dark';
  paperTheme: typeof CombinedDefaultTheme;
}

const ThemeContext = createContext<AppThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const settingsApi = useSettings();
  const isDark = settingsApi.settings.theme === 'dark';

  const paperTheme = useMemo(() => {
    const baseTheme = isDark ? CombinedDarkTheme : CombinedDefaultTheme;
    return buildPaperTheme(baseTheme, isDark);
  }, [isDark]);

  const value = useMemo<AppThemeContextType>(() => ({
    ...settingsApi,
    isDark,
    statusBarStyle: isDark ? 'light' : 'dark',
    paperTheme,
  }), [isDark, paperTheme, settingsApi]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useAppTheme = (): AppThemeContextType => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useAppTheme must be used within ThemeProvider');
  }

  return context;
};
