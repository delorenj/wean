import {
  DEFAULT_SETTINGS,
  mergeSettings,
  normalizeSettings,
  toSettingsDocument,
} from './useSettings.helpers';

describe('useSettings.helpers', () => {
  describe('normalizeSettings', () => {
    it('returns defaults for null-ish values', () => {
      expect(normalizeSettings(undefined)).toEqual(DEFAULT_SETTINGS);
      expect(normalizeSettings(null)).toEqual(DEFAULT_SETTINGS);
    });

    it('keeps valid settings values', () => {
      const normalized = normalizeSettings({
        theme: 'light',
        defaultDoseUnit: 'oz',
        sortOrder: 'oldest',
        notificationsEnabled: true,
        reminderTimes: ['09:00', '17:30'],
      });

      expect(normalized).toEqual({
        theme: 'light',
        defaultDoseUnit: 'oz',
        sortOrder: 'oldest',
        notificationsEnabled: true,
        reminderTimes: ['09:00', '17:30'],
      });
    });

    it('maps legacy darkMode values to theme', () => {
      expect(normalizeSettings({ darkMode: true }).theme).toBe('dark');
      expect(normalizeSettings({ darkMode: false }).theme).toBe('light');
    });

    it('falls back to defaults for invalid values', () => {
      const normalized = normalizeSettings({
        theme: 'amoled',
        defaultDoseUnit: 'mg',
        sortOrder: 'recent',
        notificationsEnabled: 'on',
        reminderTimes: ['08:00', '', '  ', 42],
      });

      expect(normalized).toEqual({
        theme: DEFAULT_SETTINGS.theme,
        defaultDoseUnit: DEFAULT_SETTINGS.defaultDoseUnit,
        sortOrder: DEFAULT_SETTINGS.sortOrder,
        notificationsEnabled: DEFAULT_SETTINGS.notificationsEnabled,
        reminderTimes: ['08:00'],
      });
    });
  });

  describe('mergeSettings', () => {
    it('applies updates while preserving untouched values', () => {
      const merged = mergeSettings(DEFAULT_SETTINGS, {
        theme: 'light',
        defaultDoseUnit: 'oz',
        notificationsEnabled: true,
      });

      expect(merged).toEqual({
        ...DEFAULT_SETTINGS,
        theme: 'light',
        defaultDoseUnit: 'oz',
        notificationsEnabled: true,
      });
    });

    it('sanitizes invalid updates', () => {
      const merged = mergeSettings(DEFAULT_SETTINGS, {
        theme: 'invalid' as never,
        defaultDoseUnit: 'lb' as never,
      });

      expect(merged.theme).toBe(DEFAULT_SETTINGS.theme);
      expect(merged.defaultDoseUnit).toBe(DEFAULT_SETTINGS.defaultDoseUnit);
    });
  });

  describe('toSettingsDocument', () => {
    it('includes derived darkMode boolean for persistence compatibility', () => {
      expect(toSettingsDocument({ ...DEFAULT_SETTINGS, theme: 'dark' }).darkMode).toBe(true);
      expect(toSettingsDocument({ ...DEFAULT_SETTINGS, theme: 'light' }).darkMode).toBe(false);
    });

    it('preserves theme field for Firestore settings/{uid}/theme reads', () => {
      const document = toSettingsDocument({
        ...DEFAULT_SETTINGS,
        theme: 'light',
      });

      expect(document.theme).toBe('light');
    });
  });
});
