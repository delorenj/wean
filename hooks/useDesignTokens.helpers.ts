import * as Tokens from '../src/tokens';

export interface ResolvedDesignTokens {
  colors: typeof Tokens.Colors;
  typography: typeof Tokens.Typography;
  spacing: typeof Tokens.Spacing;
  borderRadius: typeof Tokens.BorderRadius;
  shadows: typeof Tokens.Shadows;
  componentStates: typeof Tokens.ComponentStates;
  chart: typeof Tokens.ChartColors;
  safeArea: typeof Tokens.SafeAreaInsets;
  animation: typeof Tokens.Animation;
  isDark: boolean;
}

export const resolveDesignTokens = (isDark: boolean): ResolvedDesignTokens => {
  return {
    colors: isDark ? Tokens.DarkColors : Tokens.Colors,
    typography: Tokens.Typography,
    spacing: Tokens.Spacing,
    borderRadius: Tokens.BorderRadius,
    shadows: Tokens.Shadows,
    componentStates: isDark ? Tokens.DarkComponentStates : Tokens.ComponentStates,
    chart: isDark ? Tokens.DarkChartColors : Tokens.ChartColors,
    safeArea: Tokens.SafeAreaInsets,
    animation: Tokens.Animation,
    isDark,
  };
};
