import { resolveDesignTokens } from './useDesignTokens.helpers';

describe('useDesignTokens.helpers', () => {
  it('resolves light tokens with readable contrast and matching card surface', () => {
    const tokens = resolveDesignTokens(false);

    expect(tokens.isDark).toBe(false);
    expect(tokens.colors.surface).not.toEqual(tokens.colors.onSurface);
    expect(tokens.componentStates.card.default.backgroundColor).toBe(tokens.colors.surface);
  });

  it('resolves dark tokens with readable contrast and matching card surface', () => {
    const tokens = resolveDesignTokens(true);

    expect(tokens.isDark).toBe(true);
    expect(tokens.colors.surface).not.toEqual(tokens.colors.onSurface);
    expect(tokens.componentStates.card.default.backgroundColor).toBe(tokens.colors.surface);
  });

  it('returns chart palette variants with contrast in both modes', () => {
    const lightTokens = resolveDesignTokens(false);
    const darkTokens = resolveDesignTokens(true);

    expect(lightTokens.chart.gaugeTrack).not.toEqual(darkTokens.chart.gaugeTrack);
    expect(lightTokens.chart.gaugeTextPrimary).toEqual(lightTokens.colors.onSurface);
    expect(darkTokens.chart.gaugeTextPrimary).toEqual(darkTokens.colors.onSurface);
  });
});
