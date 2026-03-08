import { resolveDesignTokens } from './useDesignTokens.helpers';

describe('useDesignTokens.helpers', () => {
  it('resolves light tokens with white background and dark text', () => {
    const tokens = resolveDesignTokens(false);

    expect(tokens.isDark).toBe(false);
    expect(tokens.colors.surface).toBe('#FFFFFF');
    expect(tokens.colors.onSurface).toBe('#000000');
    expect(tokens.componentStates.card.default.backgroundColor).toBe('#FFFFFF');
  });

  it('resolves dark tokens with dark background and light text', () => {
    const tokens = resolveDesignTokens(true);

    expect(tokens.isDark).toBe(true);
    expect(tokens.colors.surface).toBe('#121212');
    expect(tokens.colors.onSurface).toBe('#FFFFFF');
    expect(tokens.componentStates.card.default.backgroundColor).toBe('#121212');
  });

  it('returns chart palette variants with contrast in both modes', () => {
    const lightTokens = resolveDesignTokens(false);
    const darkTokens = resolveDesignTokens(true);

    expect(lightTokens.chart.gaugeTrack).not.toEqual(darkTokens.chart.gaugeTrack);
    expect(lightTokens.chart.gaugeTextPrimary).toBe('#000000');
    expect(darkTokens.chart.gaugeTextPrimary).toBe('#FFFFFF');
  });
});
