import { ResolvedDesignTokens, resolveDesignTokens } from '../../hooks/useDesignTokens.helpers';

const withAlpha = (hex: string, alphaHex: string): string => {
  if (!hex.startsWith('#') || hex.length !== 7) {
    return hex;
  }

  return `${hex}${alphaHex}`;
};

const createTypographyTheme = (tokens: ResolvedDesignTokens) => ({
  displayLarge: { ...tokens.typography.displayLarge },
  displayMedium: { ...tokens.typography.displayMedium },
  displaySmall: { ...tokens.typography.displaySmall },
  headlineLarge: { ...tokens.typography.headlineLarge },
  headlineMedium: { ...tokens.typography.headlineMedium },
  headlineSmall: { ...tokens.typography.headlineSmall },
  titleLarge: { ...tokens.typography.titleLarge },
  titleMedium: { ...tokens.typography.titleMedium },
  titleSmall: { ...tokens.typography.titleSmall },
  bodyLarge: { ...tokens.typography.bodyLarge },
  bodyMedium: { ...tokens.typography.bodyMedium },
  bodySmall: { ...tokens.typography.bodySmall },
  labelLarge: { ...tokens.typography.labelLarge },
  labelMedium: { ...tokens.typography.labelMedium },
  labelSmall: { ...tokens.typography.labelSmall },
});

export const createPaperTheme = <T extends { colors: Record<string, unknown>; fonts?: unknown }>(
  baseTheme: T,
  isDark: boolean
): T => {
  const tokens = resolveDesignTokens(isDark);

  const surface = tokens.colors.surface;
  const background = isDark ? '#060B12' : tokens.colors.neutral[10];

  return {
    ...baseTheme,
    dark: isDark,
    roundness: tokens.borderRadius.lg,
    colors: {
      ...baseTheme.colors,
      primary: tokens.colors.primary[400],
      onPrimary: tokens.colors.neutral[0],
      primaryContainer: withAlpha(tokens.colors.primary[300], isDark ? '26' : '3A'),
      onPrimaryContainer: isDark ? tokens.colors.primary[100] : tokens.colors.primary[700],
      secondary: tokens.colors.secondary[400],
      onSecondary: tokens.colors.neutral[0],
      secondaryContainer: withAlpha(tokens.colors.secondary[200], isDark ? '26' : '45'),
      onSecondaryContainer: isDark ? tokens.colors.secondary[100] : tokens.colors.secondary[700],
      tertiary: tokens.colors.accent[400],
      onTertiary: tokens.colors.neutral[0],
      tertiaryContainer: withAlpha(tokens.colors.accent[200], isDark ? '26' : '45'),
      onTertiaryContainer: isDark ? tokens.colors.accent[100] : tokens.colors.accent[700],
      background,
      onBackground: tokens.colors.onSurface,
      surface,
      onSurface: tokens.colors.onSurface,
      surfaceVariant: tokens.colors.surfaceVariant,
      onSurfaceVariant: tokens.colors.onSurfaceVariant,
      outline: withAlpha(tokens.colors.neutral[400], isDark ? '7F' : '99'),
      outlineVariant: withAlpha(tokens.colors.neutral[300], isDark ? '52' : '8F'),
      error: tokens.colors.error,
      onError: tokens.colors.neutral[0],
      errorContainer: withAlpha(tokens.colors.error, isDark ? '29' : '1A'),
      onErrorContainer: isDark ? '#FFDAD6' : '#5F1513',
      elevation: {
        level0: 'transparent',
        level1: withAlpha(tokens.colors.primary[900], isDark ? '26' : '08'),
        level2: withAlpha(tokens.colors.primary[800], isDark ? '2E' : '0D'),
        level3: withAlpha(tokens.colors.primary[700], isDark ? '36' : '12'),
        level4: withAlpha(tokens.colors.primary[700], isDark ? '40' : '16'),
        level5: withAlpha(tokens.colors.primary[600], isDark ? '48' : '1A'),
      },
      surfaceDisabled: withAlpha(tokens.colors.onSurface, isDark ? '1F' : '14'),
      onSurfaceDisabled: withAlpha(tokens.colors.onSurface, isDark ? '52' : '61'),
      backdrop: tokens.colors.overlay,
    },
    fonts: createTypographyTheme(tokens),
    animation: {
      scale: isDark ? 1.02 : 1,
    },
  } as T;
};

export const getCardSurfaceStyle = (tokens: ResolvedDesignTokens) => ({
  borderRadius: tokens.borderRadius.lg,
  borderWidth: 1,
  borderColor: tokens.componentStates.card.default.borderColor,
  backgroundColor: tokens.componentStates.card.default.backgroundColor,
  ...tokens.shadows.z1,
});
