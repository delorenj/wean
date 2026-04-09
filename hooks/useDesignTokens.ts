/**
 * useDesignTokens Hook
 * Access design tokens with theme-aware fallback
 * Replaces hardcoded colors throughout the app
 */

import { useTheme } from 'react-native-paper';
import { resolveDesignTokens } from './useDesignTokens.helpers';

export const useDesignTokens = () => {
  const theme = useTheme();
  const resolvedTokens = resolveDesignTokens(theme.dark);

  return {
    ...resolvedTokens,
    theme,
  };
};

export default useDesignTokens;
