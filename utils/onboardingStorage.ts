/**
 * Onboarding Storage
 *
 * Tracks whether user has completed first-run onboarding
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export const ONBOARDING_COMPLETE_KEY = 'onboardingComplete';
const LEGACY_ONBOARDING_KEY = '@wean:onboarding_completed';

/**
 * Check if user has completed onboarding
 */
export async function isOnboardingCompleted(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);

    if (value === 'true') {
      return true;
    }

    // Backwards compatibility for existing installs.
    const legacyValue = await AsyncStorage.getItem(LEGACY_ONBOARDING_KEY);

    if (legacyValue === 'true') {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
      await AsyncStorage.removeItem(LEGACY_ONBOARDING_KEY);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Failed to check onboarding status:', error);
    return false;
  }
}

/**
 * Mark onboarding as completed
 */
export async function markOnboardingCompleted(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    await AsyncStorage.removeItem(LEGACY_ONBOARDING_KEY);
  } catch (error) {
    console.error('Failed to mark onboarding completed:', error);
    throw error;
  }
}

/**
 * Reset onboarding (for testing/debugging)
 */
export async function resetOnboarding(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY);
    await AsyncStorage.removeItem(LEGACY_ONBOARDING_KEY);
  } catch (error) {
    console.error('Failed to reset onboarding:', error);
    throw error;
  }
}
