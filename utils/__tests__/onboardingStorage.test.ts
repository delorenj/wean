/**
 * Tests for onboardingStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  isOnboardingCompleted,
  markOnboardingCompleted,
  resetOnboarding
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
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      
      const result = await isOnboardingCompleted();
      
      expect(result).toBe(false);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@wean:onboarding_completed');
    });

    it('returns true when onboarding is completed', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('true');
      
      const result = await isOnboardingCompleted();
      
      expect(result).toBe(true);
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
      
      await markOnboardingCompleted();
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@wean:onboarding_completed', 'true');
    });

    it('throws on error', async () => {
      const error = new Error('Storage error');
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(error);
      
      await expect(markOnboardingCompleted()).rejects.toThrow('Storage error');
    });
  });

  describe('resetOnboarding', () => {
    it('removes onboarding completed flag', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
      
      await resetOnboarding();
      
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@wean:onboarding_completed');
    });

    it('throws on error', async () => {
      const error = new Error('Storage error');
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(error);
      
      await expect(resetOnboarding()).rejects.toThrow('Storage error');
    });
  });
});
