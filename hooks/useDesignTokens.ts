/**
 * useDesignTokens Hook
 * Access design tokens with theme-aware fallback
 * Replaces hardcoded colors throughout the app
 */

import { useTheme } from 'react-native-paper';
import * as Tokens from '../tokens';

export const useDesignTokens = () => {
  const theme = useTheme();
  
  // Determine if dark mode
  const isDark = theme.dark;
  
  // Return theme-aware tokens
  return {
    // Colors
    colors: isDark ? Tokens.DarkColors : Tokens.Colors,
    
    // Typography
    typography: Tokens.Typography,
    
    // Spacing
    spacing: Tokens.Spacing,
    
    // Borders
    borderRadius: Tokens.BorderRadius,
    
    // Shadows
    shadows: Tokens.Shadows,
    
    // Component States
    componentStates: Tokens.ComponentStates,
    
    // Safe Area
    safeArea: Tokens.SafeAreaInsets,
    
    // Animation
    animation: Tokens.Animation,
    
    // Theme context (for convenience)
    isDark,
    theme,
  };
};

export default useDesignTokens;
