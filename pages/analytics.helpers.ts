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

export interface RollingAveragePoint extends DailyDoseTotal {
  rollingAverage: number;
}

export interface BestWeekSummary {
  weekStartISO: string;
  weekEndISO: string;
  averageDailyDose: number;
  totalDose: number;
}

export interface WeekOverWeekComparison {
  currentWeekTotal: number;
  previousWeekTotal: number;
  delta: number;
  percentChange: number;
}

export interface TrendMetrics {
  averageDailyDose: number;
  reductionRatePercent: number;
  streakDays: number;
  bestWeek: BestWeekSummary | null;
}

export interface TrendAnalyticsSnapshot {
  weekly: {
    dailyTotals: DailyDoseTotal[];
    rollingAverage: RollingAveragePoint[];
    metrics: TrendMetrics;
  };
  monthly: {
    dailyTotals: DailyDoseTotal[];
    rollingAverage: RollingAveragePoint[];
    weekOverWeek: WeekOverWeekComparison;
    metrics: TrendMetrics;
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;
const EPSILON = 0.0001;

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
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

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
    const converted = dateValue.toDate();
    return converted instanceof Date && !Number.isNaN(converted.getTime()) ? converted : null;
  }

  if (dateValue && typeof dateValue.seconds === 'number') {
    const fromSeconds = new Date(dateValue.seconds * 1000);
    return Number.isNaN(fromSeconds.getTime()) ? null : fromSeconds;
  }

  return null;
};

const convertDoseToUnit = (amount: number, fromUnit: string, targetUnit: string): number => {
  const normalizedFromUnit = fromUnit?.trim().toLowerCase();
  const normalizedTargetUnit = targetUnit?.trim().toLowerCase() || 'g';

  const fromFactor = DOSE_UNIT_TO_GRAMS[normalizedFromUnit];
  const targetFactor = DOSE_UNIT_TO_GRAMS[normalizedTargetUnit] || 1;

  if (!Number.isFinite(amount)) {
    return 0;
  }

  if (!fromFactor) {
    return amount;
  }

  const doseInGrams = amount * fromFactor;
  return doseInGrams / targetFactor;
};

const averageFromTotals = (totals: DailyDoseTotal[]): number => {
  if (!totals.length) {
    return 0;
  }

  const sum = totals.reduce((runningTotal, point) => runningTotal + point.totalDose, 0);
  return roundToTwoDecimals(sum / totals.length);
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
  const targetUnit = options.unit || 'g';

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

    const resolvedDay = getUTCStartOfDay(resolvedDate);
    const resolvedDayMs = resolvedDay.getTime();

    if (resolvedDayMs < startMs || resolvedDayMs > endMs) {
      return;
    }

    const dateISO = toUTCDateISO(resolvedDay);
    const convertedAmount = convertDoseToUnit(dose.amount, dose.doseUnit, targetUnit);

    totalsByDate[dateISO] = roundToTwoDecimals((totalsByDate[dateISO] || 0) + convertedAmount);
  });

  const totals: DailyDoseTotal[] = [];

  for (let dayOffset = 0; dayOffset < safeDays; dayOffset += 1) {
    const nextDay = addUTCDays(startDayStart, dayOffset);
    const dateISO = toUTCDateISO(nextDay);

    totals.push({
      dateISO,
      totalDose: roundToTwoDecimals(totalsByDate[dateISO] || 0),
    });
  }

  return totals;
};

export const calculateRollingAverage = (
  dailyTotals: DailyDoseTotal[],
  windowSize = 7
): RollingAveragePoint[] => {
  const safeWindowSize = Math.max(1, Math.trunc(windowSize));

  return dailyTotals.map((point, index) => {
    const startIndex = Math.max(0, index - safeWindowSize + 1);
    const window = dailyTotals.slice(startIndex, index + 1);
    const windowAverage = averageFromTotals(window);

    return {
      ...point,
      rollingAverage: windowAverage,
    };
  });
};

export const calculateReductionRatePercent = (dailyTotals: DailyDoseTotal[]): number => {
  if (dailyTotals.length < 2) {
    return 0;
  }

  const first = dailyTotals[0]?.totalDose ?? 0;
  const last = dailyTotals[dailyTotals.length - 1]?.totalDose ?? 0;

  if (first <= 0) {
    return 0;
  }

  return roundToOneDecimal(((first - last) / first) * 100);
};

export const calculateReductionStreakDays = (dailyTotals: DailyDoseTotal[]): number => {
  if (!dailyTotals.length) {
    return 0;
  }

  let streakDays = 1;

  for (let index = dailyTotals.length - 1; index > 0; index -= 1) {
    const currentDose = dailyTotals[index].totalDose;
    const previousDose = dailyTotals[index - 1].totalDose;

    if (currentDose <= previousDose + EPSILON) {
      streakDays += 1;
      continue;
    }

    break;
  }

  return streakDays;
};

export const findBestWeek = (dailyTotals: DailyDoseTotal[]): BestWeekSummary | null => {
  if (dailyTotals.length < 7) {
    return null;
  }

  let bestWindow: BestWeekSummary | null = null;

  for (let index = 0; index <= dailyTotals.length - 7; index += 1) {
    const weekWindow = dailyTotals.slice(index, index + 7);
    const totalDose = roundToTwoDecimals(
      weekWindow.reduce((runningTotal, point) => runningTotal + point.totalDose, 0)
    );
    const averageDailyDose = roundToTwoDecimals(totalDose / 7);

    if (!bestWindow || averageDailyDose < bestWindow.averageDailyDose) {
      bestWindow = {
        weekStartISO: weekWindow[0].dateISO,
        weekEndISO: weekWindow[6].dateISO,
        averageDailyDose,
        totalDose,
      };
    }
  }

  return bestWindow;
};

export const calculateWeekOverWeekComparison = (
  dailyTotals: DailyDoseTotal[]
): WeekOverWeekComparison => {
  const currentWeek = dailyTotals.slice(-7);
  const previousWeek = dailyTotals.slice(-14, -7);

  const currentWeekTotal = roundToTwoDecimals(
    currentWeek.reduce((runningTotal, point) => runningTotal + point.totalDose, 0)
  );
  const previousWeekTotal = roundToTwoDecimals(
    previousWeek.reduce((runningTotal, point) => runningTotal + point.totalDose, 0)
  );
  const delta = roundToTwoDecimals(currentWeekTotal - previousWeekTotal);

  const percentChange = previousWeekTotal <= 0
    ? 0
    : roundToOneDecimal((delta / previousWeekTotal) * 100);

  return {
    currentWeekTotal,
    previousWeekTotal,
    delta,
    percentChange,
  };
};

const buildMetrics = (
  periodTotals: DailyDoseTotal[],
  bestWeek: BestWeekSummary | null
): TrendMetrics => ({
  averageDailyDose: averageFromTotals(periodTotals),
  reductionRatePercent: calculateReductionRatePercent(periodTotals),
  streakDays: calculateReductionStreakDays(periodTotals),
  bestWeek,
});

export const buildTrendAnalytics = (
  doses: DoseHistoryLike[],
  options?: {
    endDate?: Date;
    unit?: string;
  }
): TrendAnalyticsSnapshot => {
  const endDate = options?.endDate ?? new Date();
  const unit = options?.unit ?? 'g';

  const monthlyDailyTotals = buildDailyDoseTotals(doses, {
    days: 30,
    endDate,
    unit,
  });

  const monthlyRollingAverage = calculateRollingAverage(monthlyDailyTotals, 7);

  const weeklyDailyTotals = monthlyDailyTotals.slice(-7);
  const weeklyRollingAverage = monthlyRollingAverage.slice(-7);

  const bestWeek = findBestWeek(monthlyDailyTotals);

  return {
    weekly: {
      dailyTotals: weeklyDailyTotals,
      rollingAverage: weeklyRollingAverage,
      metrics: buildMetrics(weeklyDailyTotals, bestWeek),
    },
    monthly: {
      dailyTotals: monthlyDailyTotals,
      rollingAverage: monthlyRollingAverage,
      weekOverWeek: calculateWeekOverWeekComparison(monthlyDailyTotals),
      metrics: buildMetrics(monthlyDailyTotals, bestWeek),
    },
  };
};
