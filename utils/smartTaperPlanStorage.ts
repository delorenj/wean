import AsyncStorage from '@react-native-async-storage/async-storage';
import { SmartTaperPlan } from '../pages/plan.helpers';

const STORAGE_KEY = '@wean:smart_taper_plan';

const isValidPlan = (value: unknown): value is SmartTaperPlan => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const plan = value as SmartTaperPlan;

  return (
    typeof plan.id === 'string' &&
    typeof plan.substance === 'string' &&
    typeof plan.unit === 'string' &&
    typeof plan.currentDose === 'number' &&
    typeof plan.targetDose === 'number' &&
    typeof plan.timelineDays === 'number' &&
    Array.isArray(plan.schedule)
  );
};

export const loadSmartTaperPlan = async (): Promise<SmartTaperPlan | null> => {
  try {
    const storedPlan = await AsyncStorage.getItem(STORAGE_KEY);

    if (!storedPlan) {
      return null;
    }

    const parsed = JSON.parse(storedPlan);

    if (!isValidPlan(parsed)) {
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('Failed to load smart taper plan:', error);
    return null;
  }
};

export const saveSmartTaperPlan = async (plan: SmartTaperPlan): Promise<void> => {
  if (!isValidPlan(plan)) {
    throw new Error('Invalid smart taper plan');
  }

  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  } catch (error) {
    console.error('Failed to save smart taper plan:', error);
    throw error;
  }
};

export const clearSmartTaperPlan = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear smart taper plan:', error);
    throw error;
  }
};
