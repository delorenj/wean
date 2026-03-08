import {
  DEFAULT_SETTINGS,
  mergeSettings,
  normalizeSettings,
} from './useSettings.helpers';

describe('useSettings.helpers', () => {
  describe('normalizeSettings', () => {
    it('returns defaults for null-ish values', () => {
      expect(normalizeSettings(undefined)).toEqual(DEFAULT_SETTINGS);
      expect(normalizeSettings(null)).toEqual(DEFAULT_SETTINGS);
    });

    it('keeps valid settings values', () => {
      const normalized = normalizeSettings({
        darkMode: false,
        defaultDoseUnit: 'oz',
        sortOrder: 'oldest',
        notificationsEnabled: true,
        reminderTimes: ['09:00', '17:30'],
      });

      expect(normalized).toEqual({
        darkMode: false,
        defaultDoseUnit: 'oz',
        sortOrder: 'oldest',
        notificationsEnabled: true,
        reminderTimes: ['09:00', '17:30'],
      });
    });

    it('falls back to defaults for invalid values', () => {
      const normalized = normalizeSettings({
        darkMode: 'yes',
        defaultDoseUnit: 'mg',
        sortOrder: 'recent',
        notificationsEnabled: 'on',
        reminderTimes: ['08:00', '', '  ', 42],
      });

      expect(normalized).toEqual({
        darkMode: DEFAULT_SETTINGS.darkMode,
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
        defaultDoseUnit: 'oz',
        notificationsEnabled: true,
      });

      expect(merged).toEqual({
        ...DEFAULT_SETTINGS,
        defaultDoseUnit: 'oz',
        notificationsEnabled: true,
      });
    });

    it('sanitizes invalid updates', () => {
      const merged = mergeSettings(DEFAULT_SETTINGS, {
        defaultDoseUnit: 'lb' as never,
      });

      expect(merged.defaultDoseUnit).toBe(DEFAULT_SETTINGS.defaultDoseUnit);
    });
  });
});
