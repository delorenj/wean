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
  onSurface: '#121212',
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
    0: '#121212',
    10: '#1A1A1A',
    50: '#222222',
    100: '#2E2E2E',
    200: '#3E3E3E',
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

// COMPONENT STATES
export const ComponentStates = {
  button: {
    enabled: {
      backgroundColor: Colors.primary[300],
      textColor: Colors.neutral[0],
      ...Shadows.z2,
    },
    pressed: {
      backgroundColor: Colors.primary[400],
      textColor: Colors.neutral[0],
      scale: 0.98,
      ...Shadows.z1,
    },
    disabled: {
      backgroundColor: Colors.neutral[200],
      textColor: Colors.neutral[400],
      ...Shadows.none,
    },
    loading: {
      opacity: 0.6,
      backgroundColor: Colors.primary[300],
    },
  },

  input: {
    default: {
      borderColor: Colors.neutral[300],
      backgroundColor: Colors.neutral[50],
      textColor: Colors.neutral[900],
    },
    focused: {
      borderColor: Colors.primary[300],
      backgroundColor: Colors.neutral[0],
      borderWidth: 2,
      ...Shadows.z1,
    },
    filled: {
      backgroundColor: Colors.primary[50],
      borderColor: Colors.primary[200],
      textColor: Colors.neutral[900],
    },
    error: {
      borderColor: Colors.error,
      backgroundColor: Colors.error + '08', // 8% opacity
    },
    disabled: {
      backgroundColor: Colors.neutral[100],
      textColor: Colors.neutral[400],
    },
  },

  card: {
    default: {
      backgroundColor: Colors.surface,
      borderColor: Colors.neutral[200],
      borderRadius: BorderRadius.lg,
      ...Shadows.z1,
    },
    highlighted: {
      backgroundColor: Colors.primary[50],
      borderColor: Colors.primary[200],
    },
    active: {
      backgroundColor: Colors.primary[100],
      borderColor: Colors.primary[300],
      ...Shadows.z2,
    },
    error: {
      backgroundColor: Colors.error + '08',
      borderColor: Colors.error,
    },
  },

  progressBar: {
    track: {
      backgroundColor: Colors.neutral[200],
      height: 4,
    },
    fill: {
      backgroundColor: Colors.primary[400],
    },
  },
};

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
  SafeAreaInsets,
  Animation,
  Easing,
  Breakpoints,
};
