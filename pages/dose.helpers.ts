import { Dose } from '../hooks/useDoses';
import { DoseUnit } from '../components/QuickDoseEntry/helpers';

export const OUNCE_TO_GRAMS = 28.3495;

export interface DoseRouteParams {
  mode?: 'add' | 'edit';
  doseId?: string;
}

export const resolveDoseMode = (params?: DoseRouteParams): 'add' | 'edit' => {
  if (params?.mode === 'edit' && typeof params?.doseId === 'string' && params.doseId.trim().length > 0) {
    return 'edit';
  }

  return 'add';
};

export const normalizeDoseUnitForEntry = (unit?: string): DoseUnit => {
  if (typeof unit !== 'string') {
    return 'g';
  }

  return unit.trim().toLowerCase() === 'mg' ? 'mg' : 'g';
};

export const normalizeDoseAmountForEntry = (amount: number, unit?: string): number => {
  if (!Number.isFinite(amount) || amount <= 0) {
    return 0;
  }

  const normalizedUnit = unit?.trim().toLowerCase();

  if (normalizedUnit === 'oz' || normalizedUnit === 'ounce') {
    return amount * OUNCE_TO_GRAMS;
  }

  return amount;
};

export const toEntryTimestampDate = (value: Dose['date'] | Date | undefined): Date => {
  if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    const date = value.toDate();

    if (date instanceof Date && !Number.isNaN(date.getTime())) {
      return date;
    }
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  return new Date();
};
