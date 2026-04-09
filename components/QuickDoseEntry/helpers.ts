export type DoseUnit = 'g' | 'mg';

export type DoseAdjustmentDirection = 'increment' | 'decrement';

export interface DoseEntryValidationInput {
  amount: number;
  unit: DoseUnit;
  timestamp: Date;
  now?: Date;
}

export interface DoseEntryValidationResult {
  isValid: boolean;
  amountError?: string;
  timestampError?: string;
}

export const DOSE_STEP_BY_UNIT: Record<DoseUnit, number> = {
  g: 0.1,
  mg: 50,
};

export const MAX_DOSE_BY_UNIT: Record<DoseUnit, number> = {
  g: 100,
  mg: 100000,
};

export const MIN_DOSE = 0;

const DOSE_PRECISION_BY_UNIT: Record<DoseUnit, number> = {
  g: 2,
  mg: 0,
};

const FIVE_MINUTES_MS = 5 * 60 * 1000;

export const parseDoseAmount = (value: string | number): number | null => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim().replace(',', '.');

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

export const roundToDosePrecision = (value: number, unit: DoseUnit): number => {
  const precision = DOSE_PRECISION_BY_UNIT[unit];
  const power = 10 ** precision;

  return Math.round(value * power) / power;
};

export const clampDoseAmount = (value: number, unit: DoseUnit): number => {
  if (!Number.isFinite(value)) {
    return MIN_DOSE;
  }

  const max = MAX_DOSE_BY_UNIT[unit];
  return Math.min(Math.max(value, MIN_DOSE), max);
};

export const adjustDoseAmount = (
  currentAmount: number,
  direction: DoseAdjustmentDirection,
  unit: DoseUnit,
  step = DOSE_STEP_BY_UNIT[unit]
): number => {
  const delta = direction === 'increment' ? step : -step;
  const next = clampDoseAmount(currentAmount + delta, unit);

  return roundToDosePrecision(next, unit);
};

export const convertDoseAmount = (
  amount: number,
  fromUnit: DoseUnit,
  toUnit: DoseUnit
): number => {
  if (!Number.isFinite(amount)) {
    return MIN_DOSE;
  }

  if (fromUnit === toUnit) {
    return roundToDosePrecision(clampDoseAmount(amount, toUnit), toUnit);
  }

  if (fromUnit === 'g' && toUnit === 'mg') {
    return roundToDosePrecision(clampDoseAmount(amount * 1000, toUnit), toUnit);
  }

  return roundToDosePrecision(clampDoseAmount(amount / 1000, toUnit), toUnit);
};

export const validateDoseAmount = (amount: number, unit: DoseUnit): string | undefined => {
  if (!Number.isFinite(amount)) {
    return 'Enter a valid dose amount.';
  }

  if (amount <= MIN_DOSE) {
    return 'Dose amount must be greater than 0.';
  }

  if (amount > MAX_DOSE_BY_UNIT[unit]) {
    return `Dose amount looks too high for ${unit}.`;
  }

  return undefined;
};

export const validateTimestamp = (timestamp: Date, now = new Date()): string | undefined => {
  if (!(timestamp instanceof Date) || Number.isNaN(timestamp.getTime())) {
    return 'Timestamp is invalid.';
  }

  if (timestamp.getTime() > now.getTime() + FIVE_MINUTES_MS) {
    return 'Timestamp cannot be in the future.';
  }

  return undefined;
};

export const validateDoseEntry = ({
  amount,
  unit,
  timestamp,
  now = new Date(),
}: DoseEntryValidationInput): DoseEntryValidationResult => {
  const amountError = validateDoseAmount(amount, unit);
  const timestampError = validateTimestamp(timestamp, now);

  return {
    isValid: !amountError && !timestampError,
    amountError,
    timestampError,
  };
};

export const adjustTimestampByMinutes = (timestamp: Date, minutesDelta: number): Date => {
  const next = new Date(timestamp);
  next.setMinutes(next.getMinutes() + minutesDelta);

  return next;
};

export const formatDoseInput = (amount: number, unit: DoseUnit): string => {
  if (!Number.isFinite(amount)) {
    return '';
  }

  if (unit === 'mg') {
    return `${Math.round(amount)}`;
  }

  const rounded = roundToDosePrecision(amount, unit);
  return rounded.toString();
};

export const formatEntryTimestampLabel = (
  timestamp: Date,
  locale?: string | string[]
): string => {
  if (!(timestamp instanceof Date) || Number.isNaN(timestamp.getTime())) {
    return 'Invalid time';
  }

  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(timestamp);
};
