import { Dose } from '../../hooks/useDoses';

export interface TimelineDateLike {
  toDate?: () => Date;
}

export interface DailyDoseTimelineEntry {
  key: string;
  timestamp: Date;
  timeLabel: string;
  amount: number;
  unit: string;
  substance: string;
}

export interface FormatTimelineTimeOptions {
  locale?: string;
  timeZone?: string;
}

export interface BuildDailyDoseTimelineEntriesOptions extends FormatTimelineTimeOptions {
  fallbackUnit?: string;
  sortOrder?: 'asc' | 'desc';
}

const parseDate = (value: unknown): Date | null => {
  if (value && typeof value === 'object' && 'toDate' in (value as TimelineDateLike)) {
    const maybeDate = (value as TimelineDateLike).toDate?.();

    if (maybeDate instanceof Date && !Number.isNaN(maybeDate.getTime())) {
      return maybeDate;
    }
  }

  const parsed = value instanceof Date ? new Date(value) : new Date(value as string | number);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
};

const sanitizeAmount = (value: number): number => {
  if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
    return 0;
  }

  return Math.max(value, 0);
};

const resolveUnit = (unit: string | undefined, fallbackUnit = 'g'): string => {
  const trimmedUnit = typeof unit === 'string' ? unit.trim() : '';

  if (trimmedUnit.length > 0) {
    return trimmedUnit;
  }

  const trimmedFallback = fallbackUnit.trim();
  return trimmedFallback.length > 0 ? trimmedFallback : 'g';
};

export const parseDoseTimestamp = (value: unknown): Date | null => parseDate(value);

export const formatTimelineTime = (
  value: Date,
  options: FormatTimelineTimeOptions = {}
): string => {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    return '--';
  }

  return new Intl.DateTimeFormat(options.locale, {
    hour: 'numeric',
    minute: '2-digit',
    ...(options.timeZone ? { timeZone: options.timeZone } : {}),
  }).format(value);
};

export const formatTimelineDoseAmount = (value: number): string => {
  const sanitized = sanitizeAmount(value);

  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(sanitized);
};

export const buildDailyDoseTimelineEntries = (
  doses: Dose[] = [],
  options: BuildDailyDoseTimelineEntriesOptions = {}
): DailyDoseTimelineEntry[] => {
  const {
    fallbackUnit = 'g',
    locale,
    timeZone,
    sortOrder = 'desc',
  } = options;

  const entries = doses
    .map((dose, index) => {
      const timestamp = parseDate(dose.date);

      if (!timestamp) {
        return null;
      }

      const amount = sanitizeAmount(dose.amount);
      const unit = resolveUnit(dose.doseUnit, fallbackUnit);

      return {
        key: `${timestamp.getTime()}-${index}`,
        timestamp,
        timeLabel: formatTimelineTime(timestamp, { locale, timeZone }),
        amount,
        unit,
        substance: dose.substance,
      } satisfies DailyDoseTimelineEntry;
    })
    .filter((entry): entry is DailyDoseTimelineEntry => entry !== null);

  entries.sort((left, right) => {
    if (sortOrder === 'asc') {
      return left.timestamp.getTime() - right.timestamp.getTime();
    }

    return right.timestamp.getTime() - left.timestamp.getTime();
  });

  return entries;
};
