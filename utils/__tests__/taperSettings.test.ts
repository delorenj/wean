/**
 * Tests for taperSettings storage adapter
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  loadTaperSettings,
  saveTaperSettings,
  clearTaperSettings,
  DEFAULT_TAPER_SETTINGS,
  TaperSettings
} from '../taperSettings';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('taperSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadTaperSettings', () => {
    it('should return defaults when no stored data exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await loadTaperSettings();

      expect(result).toEqual(DEFAULT_TAPER_SETTINGS);
    });

    it('should parse and return valid stored settings', async () => {
      const stored: TaperSettings = {
        startDose: 15,
        targetDose: 2,
        durationDays: 45,
        unit: 'mg'
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(stored));

      const result = await loadTaperSettings();

      expect(result).toEqual(stored);
    });

    it('should sanitize invalid numeric values', async () => {
      const invalid = {
        startDose: -5,
        targetDose: 'invalid',
        durationDays: 20.7,
        unit: 'g'
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(invalid));

      const result = await loadTaperSettings();

      expect(result.startDose).toBe(DEFAULT_TAPER_SETTINGS.startDose); // negative becomes default
      expect(result.targetDose).toBe(DEFAULT_TAPER_SETTINGS.targetDose); // invalid becomes default
      expect(result.durationDays).toBe(20); // decimal gets floored
    });

    it('should sanitize empty/invalid unit strings', async () => {
      const invalid = {
        startDose: 10,
        targetDose: 0,
        durationDays: 30,
        unit: '   '
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(invalid));

      const result = await loadTaperSettings();

      expect(result.unit).toBe(DEFAULT_TAPER_SETTINGS.unit);
    });

    it('should return defaults on JSON parse error', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('invalid json{');

      const result = await loadTaperSettings();

      expect(result).toEqual(DEFAULT_TAPER_SETTINGS);
    });

    it('should return defaults on AsyncStorage error', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const result = await loadTaperSettings();

      expect(result).toEqual(DEFAULT_TAPER_SETTINGS);
    });
  });

  describe('saveTaperSettings', () => {
    it('should save valid settings to AsyncStorage', async () => {
      const settings: TaperSettings = {
        startDose: 25,
        targetDose: 5,
        durationDays: 60,
        unit: 'ml'
      };

      await saveTaperSettings(settings);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@wean:taper_settings',
        JSON.stringify(settings)
      );
    });

    it('should floor duration to integer', async () => {
      const settings: TaperSettings = {
        startDose: 20,
        targetDose: 0,
        durationDays: 30.9,
        unit: 'g'
      };

      await saveTaperSettings(settings);

      const saved = JSON.parse(
        (mockAsyncStorage.setItem as jest.Mock).mock.calls[0][1]
      );
      expect(saved.durationDays).toBe(30);
    });

    it('should trim unit string', async () => {
      const settings: TaperSettings = {
        startDose: 20,
        targetDose: 0,
        durationDays: 30,
        unit: '  mg  '
      };

      await saveTaperSettings(settings);

      const saved = JSON.parse(
        (mockAsyncStorage.setItem as jest.Mock).mock.calls[0][1]
      );
      expect(saved.unit).toBe('mg');
    });

    it('should reject negative start dose', async () => {
      const settings: TaperSettings = {
        startDose: -10,
        targetDose: 0,
        durationDays: 30,
        unit: 'g'
      };

      await expect(saveTaperSettings(settings)).rejects.toThrow(
        'Invalid taper settings values'
      );
    });

    it('should reject negative target dose', async () => {
      const settings: TaperSettings = {
        startDose: 20,
        targetDose: -5,
        durationDays: 30,
        unit: 'g'
      };

      await expect(saveTaperSettings(settings)).rejects.toThrow(
        'Invalid taper settings values'
      );
    });

    it('should reject duration less than 1', async () => {
      const settings: TaperSettings = {
        startDose: 20,
        targetDose: 0,
        durationDays: 0,
        unit: 'g'
      };

      await expect(saveTaperSettings(settings)).rejects.toThrow(
        'Invalid taper settings values'
      );
    });

    it('should reject target dose greater than start dose', async () => {
      const settings: TaperSettings = {
        startDose: 10,
        targetDose: 20,
        durationDays: 30,
        unit: 'g'
      };

      await expect(saveTaperSettings(settings)).rejects.toThrow(
        'Target dose cannot exceed start dose'
      );
    });

    it('should use default unit if empty after trim', async () => {
      const settings: TaperSettings = {
        startDose: 20,
        targetDose: 0,
        durationDays: 30,
        unit: '   '
      };

      await saveTaperSettings(settings);

      const saved = JSON.parse(
        (mockAsyncStorage.setItem as jest.Mock).mock.calls[0][1]
      );
      expect(saved.unit).toBe(DEFAULT_TAPER_SETTINGS.unit);
    });
  });

  describe('clearTaperSettings', () => {
    it('should remove settings from AsyncStorage', async () => {
      await clearTaperSettings();

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(
        '@wean:taper_settings'
      );
    });

    it('should throw on AsyncStorage error', async () => {
      mockAsyncStorage.removeItem.mockRejectedValue(new Error('Remove failed'));

      await expect(clearTaperSettings()).rejects.toThrow('Remove failed');
    });
  });
});
