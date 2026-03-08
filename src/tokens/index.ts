/**
 * Design Tokens for Wean App
 * Dark-first recovery aesthetic with premium surface hierarchy.
 */

// COLORS
export const Colors = {
  primary: {
    50: '#EAFBF7',
    100: '#CEF6EC',
    200: '#A6EEDC',
    300: '#76E1C8',
    400: '#48D2B3',
    500: '#24BA9A',
    600: '#1A977E',
    700: '#127563',
    800: '#0D5648',
    900: '#093A32',
  },

  secondary: {
    50: '#ECF5FF',
    100: '#D7EAFE',
    200: '#B6D9FD',
    300: '#8BC2FA',
    400: '#5DA5F6',
    500: '#3E8BF0',
    600: '#2A6FD0',
    700: '#1F55A7',
    800: '#173D78',
    900: '#122A50',
  },

  accent: {
    50: '#F5ECFF',
    100: '#EBDDFF',
    200: '#D8C1FF',
    300: '#C19BFF',
    400: '#A976FF',
    500: '#9257F5',
    600: '#7743D1',
    700: '#5E35A6',
    800: '#46287A',
    900: '#301C52',
  },

  neutral: {
    0: '#FFFFFF',
    10: '#FCFDFE',
    50: '#F5F8FA',
    100: '#EAF0F5',
    200: '#D8E2EB',
    300: '#BBC9D6',
    400: '#97AAB9',
    500: '#74899A',
    600: '#596F80',
    700: '#3F5567',
    800: '#273B4D',
    900: '#121F2D',
  },

  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  surface: '#F5F8FA',
  surfaceVariant: '#EAF0F5',
  onSurface: '#111B27',
  onSurfaceVariant: '#4B6276',

  overlay: 'rgba(9, 19, 31, 0.52)',
  scrim: 'rgba(5, 11, 18, 0.26)',
};

// DARK MODE OVERRIDES
export const DarkColors = {
  ...Colors,
  surface: '#090F16',
  surfaceVariant: '#131C27',
  onSurface: '#F4F8FC',
  onSurfaceVariant: '#A5B4C5',
  neutral: {
    ...Colors.neutral,
    0: '#FFFFFF',
    10: '#0D151E',
    50: '#131C27',
    100: '#1B2734',
    200: '#263646',
    300: '#33495E',
    400: '#4A6279',
    500: '#6B859D',
    600: '#90A7BB',
    700: '#B2C4D2',
    800: '#D2DEE8',
    900: '#F4F8FC',
  },
  overlay: 'rgba(0, 0, 0, 0.7)',
  scrim: 'rgba(0, 0, 0, 0.45)',
};

// TYPOGRAPHY
export const Typography = {
  displayLarge: {
    fontSize: 56,
    lineHeight: 62,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  displayMedium: {
    fontSize: 44,
    lineHeight: 50,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  displaySmall: {
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '500',
    letterSpacing: 0,
  },

  headlineLarge: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  headlineMedium: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -0.05,
  },
  headlineSmall: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    letterSpacing: 0,
  },

  titleLarge: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: 0,
  },
  titleMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  titleSmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    letterSpacing: 0.1,
  },

  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    letterSpacing: 0.15,
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
    letterSpacing: 0.15,
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400',
    letterSpacing: 0.1,
  },

  labelLarge: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    letterSpacing: 0.15,
  },
  labelMedium: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.15,
  },
  labelSmall: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
};

// SPACING
export const Spacing = {
  0: 0,
  2: 2,
  4: 4,
  6: 6,
  8: 8,
  10: 10,
  12: 12,
  14: 14,
  16: 16,
  18: 18,
  20: 20,
  24: 24,
  28: 28,
  32: 32,
  36: 36,
  40: 40,
  48: 48,
  56: 56,
  64: 64,
  72: 72,
};

// BORDER RADIUS
export const BorderRadius = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
};

// SHADOWS
export const Shadows = {
  none: {},
  z1: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
  },
  z2: {
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.24,
    shadowRadius: 4,
  },
  z3: {
    elevation: 9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
  },
  z4: {
    elevation: 13,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.34,
    shadowRadius: 8,
  },
};

type TokenPalette = typeof Colors;

// COMPONENT STATES
export const createComponentStates = (palette: TokenPalette) => ({
  button: {
    enabled: {
      backgroundColor: palette.primary[400],
      textColor: palette.neutral[0],
      ...Shadows.z2,
    },
    pressed: {
      backgroundColor: palette.primary[500],
      textColor: palette.neutral[0],
      scale: 0.98,
      ...Shadows.z1,
    },
    disabled: {
      backgroundColor: palette.neutral[200],
      textColor: palette.onSurfaceVariant,
      ...Shadows.none,
    },
    loading: {
      opacity: 0.65,
      backgroundColor: palette.primary[400],
    },
  },

  input: {
    default: {
      borderColor: palette.neutral[300],
      backgroundColor: palette.surfaceVariant,
      textColor: palette.onSurface,
    },
    focused: {
      borderColor: palette.primary[300],
      backgroundColor: palette.surface,
      borderWidth: 2,
      ...Shadows.z1,
    },
    filled: {
      backgroundColor: palette.primary[50],
      borderColor: palette.primary[200],
      textColor: palette.onSurface,
    },
    error: {
      borderColor: palette.error,
      backgroundColor: `${palette.error}14`,
    },
    disabled: {
      backgroundColor: palette.neutral[100],
      textColor: palette.onSurfaceVariant,
    },
  },

  card: {
    default: {
      backgroundColor: palette.surface,
      borderColor: palette.neutral[200],
      borderRadius: BorderRadius.lg,
      ...Shadows.z1,
    },
    highlighted: {
      backgroundColor: palette.primary[50],
      borderColor: palette.primary[200],
    },
    active: {
      backgroundColor: palette.primary[100],
      borderColor: palette.primary[300],
      ...Shadows.z2,
    },
    error: {
      backgroundColor: `${palette.error}12`,
      borderColor: palette.error,
    },
  },

  progressBar: {
    track: {
      backgroundColor: palette.neutral[200],
      height: 6,
    },
    fill: {
      backgroundColor: palette.primary[400],
    },
  },
});

export const ComponentStates = createComponentStates(Colors);
export const DarkComponentStates = createComponentStates(DarkColors);

export const createChartColors = (palette: TokenPalette) => ({
  gaugeTrack: palette.neutral[200],
  gaugeProgress: palette.primary[400],
  gaugeWarning: palette.warning,
  gaugeTextPrimary: palette.onSurface,
  gaugeTextSecondary: palette.onSurfaceVariant,
  linePrimary: palette.primary[400],
  lineSecondary: palette.secondary[400],
  lineAccent: palette.accent[400],
});

export const ChartColors = createChartColors(Colors);
export const DarkChartColors = createChartColors(DarkColors);

export const SafeAreaInsets = {
  screenPadding: Spacing[16],
  contentGap: Spacing[10],
  bottomBar: Spacing[16],
};

export const Animation = {
  fast: 140,
  normal: 220,
  slow: 320,
  verySlow: 500,
};

export const Easing = {
  linear: 'linear',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
};

export const Breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
};

export default {
  Colors,
  DarkColors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  ComponentStates,
  DarkComponentStates,
  ChartColors,
  DarkChartColors,
  SafeAreaInsets,
  Animation,
  Easing,
  Breakpoints,
};
