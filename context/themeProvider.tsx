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
import { resolveDesignTokens } from '../hooks/useDesignTokens.helpers';

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

const createPaperTheme = (isDark: boolean) => {
  const baseTheme = isDark ? CombinedDarkTheme : CombinedDefaultTheme;
  const tokens = resolveDesignTokens(isDark);

  return {
    ...baseTheme,
    dark: isDark,
    colors: {
      ...baseTheme.colors,
      background: tokens.colors.surface,
      surface: tokens.colors.surface,
      surfaceVariant: tokens.colors.surfaceVariant,
      onSurface: tokens.colors.onSurface,
      onSurfaceVariant: tokens.colors.onSurfaceVariant,
      onBackground: tokens.colors.onSurface,
      primary: tokens.colors.primary[300],
      onPrimary: tokens.colors.neutral[0],
      primaryContainer: tokens.colors.primary[100],
      onPrimaryContainer: tokens.colors.primary[700],
      outline: tokens.colors.neutral[300],
      error: tokens.colors.error,
      onError: tokens.colors.neutral[0],
    },
  };
};

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const settingsApi = useSettings();
  const isDark = settingsApi.settings.theme === 'dark';

  const paperTheme = useMemo(() => createPaperTheme(isDark), [isDark]);

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
