export interface DoseTimestampLike {
  toDate?: () => Date;
  seconds?: number;
}

export interface DoseHistoryLike {
  amount: number;
  doseUnit: string;
  date: Date | DoseTimestampLike;
}

export interface DailyDoseTotal {
  dateISO: string;
  totalDose: number;
}

export type TrendDirection = 'up' | 'down' | 'stable';

export interface TrendDirectionSummary {
  direction: TrendDirection;
  delta: number;
  deltaPercent: number;
}

export interface AnalyticsPeriodSnapshot {
  dailyTotals: DailyDoseTotal[];
  averageDailyDose: number;
  trend: TrendDirectionSummary;
  reductionStreakDays: number;
}

export interface TrendAnalyticsSnapshot {
  weekly: AnalyticsPeriodSnapshot;
  monthly: AnalyticsPeriodSnapshot;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const EPSILON = 0.0001;
const STABLE_TREND_THRESHOLD_PERCENT = 2;

const DOSE_UNIT_TO_GRAMS: Record<string, number> = {
  g: 1,
  gram: 1,
  grams: 1,
  mg: 0.001,
  milligram: 0.001,
  milligrams: 0.001,
  oz: 28.3495,
  ounce: 28.3495,
  ounces: 28.3495,
};

const roundToTwoDecimals = (value: number): number => Math.round(value * 100) / 100;
const roundToOneDecimal = (value: number): number => Math.round(value * 10) / 10;

export const getUTCStartOfDay = (date: Date): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));

export const addUTCDays = (date: Date, days: number): Date => {
  const safeDays = Number.isFinite(days) ? Math.trunc(days) : 0;
  return new Date(date.getTime() + safeDays * DAY_MS);
};

export const toUTCDateISO = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const resolveDoseDate = (dateValue: Date | DoseTimestampLike): Date | null => {
  if (dateValue instanceof Date) {
    return Number.isNaN(dateValue.getTime()) ? null : dateValue;
  }

  if (dateValue && typeof dateValue.toDate === 'function') {
    const convertedDate = dateValue.toDate();
    return convertedDate instanceof Date && !Number.isNaN(convertedDate.getTime()) ? convertedDate : null;
  }

  if (dateValue && typeof dateValue.seconds === 'number') {
    const convertedDate = new Date(dateValue.seconds * 1000);
    return Number.isNaN(convertedDate.getTime()) ? null : convertedDate;
  }

  return null;
};

const convertDoseToUnit = (amount: number, fromUnit: string, targetUnit: string): number => {
  if (!Number.isFinite(amount)) {
    return 0;
  }

  const normalizedFromUnit = fromUnit?.trim().toLowerCase();
  const normalizedTargetUnit = targetUnit?.trim().toLowerCase() || 'g';

  const fromFactor = DOSE_UNIT_TO_GRAMS[normalizedFromUnit];
  const targetFactor = DOSE_UNIT_TO_GRAMS[normalizedTargetUnit] || 1;

  if (!fromFactor) {
    return amount;
  }

  const grams = amount * fromFactor;
  return grams / targetFactor;
};

export const buildDailyDoseTotals = (
  doses: DoseHistoryLike[],
  options: {
    days: number;
    endDate?: Date;
    unit?: string;
  }
): DailyDoseTotal[] => {
  const safeDays = Math.max(1, Math.trunc(options.days));
  const endDate = options.endDate ?? new Date();
  const targetUnit = options.unit ?? 'g';

  const endDayStart = getUTCStartOfDay(endDate);
  const startDayStart = addUTCDays(endDayStart, -(safeDays - 1));

  const startMs = startDayStart.getTime();
  const endMs = endDayStart.getTime();

  const totalsByDate: Record<string, number> = {};

  doses.forEach((dose) => {
    const resolvedDate = resolveDoseDate(dose.date);

    if (!resolvedDate) {
      return;
    }

    const dayStart = getUTCStartOfDay(resolvedDate);
    const dayMs = dayStart.getTime();

    if (dayMs < startMs || dayMs > endMs) {
      return;
    }

    const dateISO = toUTCDateISO(dayStart);
    const convertedAmount = convertDoseToUnit(dose.amount, dose.doseUnit, targetUnit);
    totalsByDate[dateISO] = roundToTwoDecimals((totalsByDate[dateISO] || 0) + convertedAmount);
  });

  const dailyTotals: DailyDoseTotal[] = [];

  for (let offset = 0; offset < safeDays; offset += 1) {
    const date = addUTCDays(startDayStart, offset);
    const dateISO = toUTCDateISO(date);

    dailyTotals.push({
      dateISO,
      totalDose: roundToTwoDecimals(totalsByDate[dateISO] || 0),
    });
  }

  return dailyTotals;
};

export const calculateAverageDailyDose = (dailyTotals: DailyDoseTotal[]): number => {
  if (!dailyTotals.length) {
    return 0;
  }

  const total = dailyTotals.reduce((sum, point) => sum + point.totalDose, 0);
  return roundToTwoDecimals(total / dailyTotals.length);
};

export const calculateTrendDirection = (dailyTotals: DailyDoseTotal[]): TrendDirectionSummary => {
  if (dailyTotals.length < 2) {
    return {
      direction: 'stable',
      delta: 0,
      deltaPercent: 0,
    };
  }

  const first = dailyTotals[0]?.totalDose ?? 0;
  const last = dailyTotals[dailyTotals.length - 1]?.totalDose ?? 0;
  const delta = roundToTwoDecimals(last - first);

  const baseline = first > EPSILON ? first : Math.max(calculateAverageDailyDose(dailyTotals), 1);
  const deltaPercent = roundToOneDecimal((delta / baseline) * 100);

  if (Math.abs(deltaPercent) < STABLE_TREND_THRESHOLD_PERCENT || Math.abs(delta) < EPSILON) {
    return {
      direction: 'stable',
      delta,
      deltaPercent,
    };
  }

  return {
    direction: delta > 0 ? 'up' : 'down',
    delta,
    deltaPercent,
  };
};

export const calculateDoseReductionStreak = (dailyTotals: DailyDoseTotal[]): number => {
  if (dailyTotals.length < 2) {
    return 0;
  }

  let reductionTransitions = 0;

  for (let index = dailyTotals.length - 1; index > 0; index -= 1) {
    const currentDose = dailyTotals[index].totalDose;
    const previousDose = dailyTotals[index - 1].totalDose;

    if (currentDose < previousDose - EPSILON) {
      reductionTransitions += 1;
      continue;
    }

    break;
  }

  if (reductionTransitions === 0) {
    return 0;
  }

  return reductionTransitions + 1;
};

export const buildAnalyticsPeriod = (
  doses: DoseHistoryLike[],
  options: {
    days: number;
    endDate?: Date;
    unit?: string;
  }
): AnalyticsPeriodSnapshot => {
  const dailyTotals = buildDailyDoseTotals(doses, options);

  return {
    dailyTotals,
    averageDailyDose: calculateAverageDailyDose(dailyTotals),
    trend: calculateTrendDirection(dailyTotals),
    reductionStreakDays: calculateDoseReductionStreak(dailyTotals),
  };
};

export const buildTrendAnalyticsSnapshot = (
  doses: DoseHistoryLike[],
  options?: {
    endDate?: Date;
    unit?: string;
  }
): TrendAnalyticsSnapshot => {
  const endDate = options?.endDate ?? new Date();
  const unit = options?.unit ?? 'g';

  const monthly = buildAnalyticsPeriod(doses, {
    days: 30,
    endDate,
    unit,
  });

  const weeklyDailyTotals = monthly.dailyTotals.slice(-7);

  return {
    weekly: {
      dailyTotals: weeklyDailyTotals,
      averageDailyDose: calculateAverageDailyDose(weeklyDailyTotals),
      trend: calculateTrendDirection(weeklyDailyTotals),
      reductionStreakDays: calculateDoseReductionStreak(weeklyDailyTotals),
    },
    monthly,
  };
};
