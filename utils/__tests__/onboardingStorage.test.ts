/**
 * Tests for onboardingStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  isOnboardingCompleted,
  markOnboardingCompleted,
  ONBOARDING_COMPLETE_KEY,
  resetOnboarding,
} from '../onboardingStorage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('onboardingStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isOnboardingCompleted', () => {
    it('returns false when onboarding not completed', async () => {
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      const result = await isOnboardingCompleted();

      expect(result).toBe(false);
      expect(AsyncStorage.getItem).toHaveBeenNthCalledWith(1, ONBOARDING_COMPLETE_KEY);
      expect(AsyncStorage.getItem).toHaveBeenNthCalledWith(2, '@wean:onboarding_completed');
    });

    it('returns true when onboarding is completed using current key', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('true');

      const result = await isOnboardingCompleted();

      expect(result).toBe(true);
      expect(AsyncStorage.getItem).toHaveBeenCalledTimes(1);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(ONBOARDING_COMPLETE_KEY);
    });

    it('migrates legacy key to new key', async () => {
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce('true');
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      const result = await isOnboardingCompleted();

      expect(result).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(ONBOARDING_COMPLETE_KEY, 'true');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@wean:onboarding_completed');
    });

    it('returns false on error', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await isOnboardingCompleted();

      expect(result).toBe(false);
    });
  });

  describe('markOnboardingCompleted', () => {
    it('sets onboarding completed flag', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      await markOnboardingCompleted();

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(ONBOARDING_COMPLETE_KEY, 'true');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@wean:onboarding_completed');
    });

    it('throws on error', async () => {
      const error = new Error('Storage error');
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(error);

      await expect(markOnboardingCompleted()).rejects.toThrow('Storage error');
    });
  });

  describe('resetOnboarding', () => {
    it('removes onboarding completed flags', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      await resetOnboarding();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(ONBOARDING_COMPLETE_KEY);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@wean:onboarding_completed');
    });

    it('throws on error', async () => {
      const error = new Error('Storage error');
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(error);

      await expect(resetOnboarding()).rejects.toThrow('Storage error');
    });
  });
});
