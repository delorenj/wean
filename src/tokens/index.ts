/**
 * Design Tokens for Wean App
 * Material 3 compliant, substance-abuse recovery themed
 * Primary color: Soft teal (#3BAA93) = hope + calm
 */

// COLORS
export const Colors = {
  // Primary: Teal (recovery, hope, calm)
  primary: {
    50: '#F0F9F8',
    100: '#D1EEE9',
    200: '#A3DED4',
    300: '#75CEBD',  // Main brand color
    400: '#58C4AC',
    500: '#3BAA93',  // Dark primary
    600: '#2D8B78',
    700: '#1F6B5D',
    800: '#134C42',
    900: '#0A2E27',
  },

  // Neutral: Cool grays
  neutral: {
    0: '#FFFFFF',
    10: '#FAFAFA',
    50: '#F8F8F8',
    100: '#F3F3F3',
    200: '#E8E8E8',
    300: '#DCDCDC',
    400: '#C0C0C0',
    500: '#888888',
    600: '#666666',
    700: '#444444',
    800: '#222222',
    900: '#121212',
  },

  // Semantic colors
  success: '#10B981',    // Green - milestones, achievements
  warning: '#F59E0B',    // Amber - tapering risk, caution
  error: '#EF4444',      // Red - critical, mistakes
  info: '#3B82F6',       // Blue - information, tips

  // Surfaces (for containers)
  surface: '#FFFFFF',
  surfaceVariant: '#F3F3F3',
  onSurface: '#000000',
  onSurfaceVariant: '#666666',

  // Overlay (for modals, sheets)
  overlay: 'rgba(0, 0, 0, 0.32)',
  scrim: 'rgba(0, 0, 0, 0.12)',
};

// DARK MODE OVERRIDES
export const DarkColors = {
  ...Colors,
  surface: '#121212',
  surfaceVariant: '#1F1F1F',
  onSurface: '#FFFFFF',
  onSurfaceVariant: '#CCCCCC',
  neutral: {
    ...Colors.neutral,
    10: '#1A1A1A',
    50: '#222222',
    100: '#2E2E2E',
    200: '#3E3E3E',
    300: '#4A4A4A',
    400: '#666666',
    500: '#8A8A8A',
    600: '#B0B0B0',
    700: '#D0D0D0',
    800: '#E2E2E2',
    900: '#FFFFFF',
  },
};

// TYPOGRAPHY
export const Typography = {
  displayLarge: {
    fontSize: 57,
    lineHeight: 64,
    fontWeight: '400',
    letterSpacing: 0,
  },
  displayMedium: {
    fontSize: 45,
    lineHeight: 52,
    fontWeight: '400',
    letterSpacing: 0,
  },
  displaySmall: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '400',
    letterSpacing: 0,
  },

  headlineLarge: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '600',
    letterSpacing: 0,
  },
  headlineMedium: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '600',
    letterSpacing: 0,
  },
  headlineSmall: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    letterSpacing: 0.1,
  },

  titleLarge: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600',
    letterSpacing: 0,
  },
  titleMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    letterSpacing: 0.15,
  },
  titleSmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    letterSpacing: 0.1,
  },

  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    letterSpacing: 0.4,
  },

  labelLarge: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
};

// SPACING (8px grid)
export const Spacing = {
  0: 0,
  2: 2,
  4: 4,
  6: 6,
  8: 8,
  12: 12,
  16: 16,
  20: 20,
  24: 24,
  32: 32,
  40: 40,
  48: 48,
  56: 56,
  64: 64,
};

// BORDER RADIUS
export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// SHADOWS (z-depth 1-4)
export const Shadows = {
  none: {},
  z1: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
  },
  z2: {
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  z3: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  z4: {
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
  },
};

type TokenPalette = typeof Colors;

// COMPONENT STATES
export const createComponentStates = (palette: TokenPalette) => ({
  button: {
    enabled: {
      backgroundColor: palette.primary[300],
      textColor: palette.neutral[0],
      ...Shadows.z2,
    },
    pressed: {
      backgroundColor: palette.primary[400],
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
      opacity: 0.6,
      backgroundColor: palette.primary[300],
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
      backgroundColor: palette.error + '08', // 8% opacity
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
      backgroundColor: palette.error + '08',
      borderColor: palette.error,
    },
  },

  progressBar: {
    track: {
      backgroundColor: palette.neutral[200],
      height: 4,
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
});

export const ChartColors = createChartColors(Colors);
export const DarkChartColors = createChartColors(DarkColors);

// SAFE AREA INSETS (for notched devices)
export const SafeAreaInsets = {
  screenPadding: Spacing[16],    // Standard content inset
  contentGap: Spacing[8],        // Between items
  bottomBar: Spacing[12],        // Above FAB/tab bar
};

// ANIMATION DURATIONS
export const Animation = {
  fast: 150,      // ms
  normal: 200,    // ms (default)
  slow: 300,      // ms
  verySlow: 500,  // ms
};

// ANIMATION EASING
export const Easing = {
  linear: 'linear',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
};

// BREAKPOINTS (mobile-first)
export const Breakpoints = {
  xs: 0,      // Mobile
  sm: 576,    // Small tablet
  md: 768,    // Tablet
  lg: 992,    // Large tablet/desktop
  xl: 1200,   // Desktop
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
