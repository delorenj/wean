export const DAYS_IN_WEEK = 7;

export interface RollingCalendarWeekEntry {
  date: Date | string | number;
  doseTaken?: number | null;
  targetDose?: number | null;
  unit?: string;
}

export interface AggregatedDayEntry {
  doseTaken: number | null;
  targetDose: number | null;
  unit: string | null;
}

export type RollingCalendarDayStatus = 'future' | 'warning' | 'adherent' | 'logged' | 'empty';

export interface RollingCalendarDayState {
  key: string;
  date: Date;
  dayLabel: string;
  dateLabel: string;
  doseTaken: number | null;
  targetDose: number | null;
  unit: string | null;
  isToday: boolean;
  isFuture: boolean;
  isOverTarget: boolean;
  isAdherent: boolean;
  status: RollingCalendarDayStatus;
}

export interface BuildRollingCalendarWeekDayStatesOptions {
  entries?: RollingCalendarWeekEntry[];
  anchorDate?: Date;
  now?: Date;
  weekOffset?: number;
  weekStartsOn?: number;
  defaultTargetDose?: number | null;
  defaultUnit?: string;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const normalizeWeekStartsOn = (weekStartsOn: number): number => {
  if (!Number.isInteger(weekStartsOn)) {
    return 0;
  }

  const safeStart = weekStartsOn % DAYS_IN_WEEK;
  return safeStart < 0 ? safeStart + DAYS_IN_WEEK : safeStart;
};

export const toDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const startOfDay = (value: Date): Date => {
  const next = new Date(value);
  next.setHours(0, 0, 0, 0);
  return next;
};

export const addDays = (value: Date, amount: number): Date => {
  const next = new Date(value);
  next.setDate(next.getDate() + amount);
  return next;
};

export const isSameCalendarDay = (left: Date, right: Date): boolean => toDateKey(left) === toDateKey(right);

export const getWeekStart = (value: Date, weekStartsOn = 0): Date => {
  const normalized = startOfDay(value);
  const startDay = normalizeWeekStartsOn(weekStartsOn);
  const day = normalized.getDay();
  const diff = (day - startDay + DAYS_IN_WEEK) % DAYS_IN_WEEK;

  return addDays(normalized, -diff);
};

export const buildCalendarWeekDates = (
  anchorDate: Date,
  weekOffset = 0,
  weekStartsOn = 0
): Date[] => {
  const shiftDays = weekOffset * DAYS_IN_WEEK;
  const shiftedAnchor = addDays(anchorDate, shiftDays);
  const weekStart = getWeekStart(shiftedAnchor, weekStartsOn);

  return Array.from({ length: DAYS_IN_WEEK }, (_, index) => addDays(weekStart, index));
};

const parseDate = (value: Date | string | number): Date | null => {
  const parsed = value instanceof Date ? new Date(value) : new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
};

const sanitizeDose = (value: number | null | undefined): number | null => {
  if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
    return null;
  }

  return Math.max(value, 0);
};

export const aggregateEntriesByDate = (
  entries: RollingCalendarWeekEntry[] = []
): Record<string, AggregatedDayEntry> => {
  const map: Record<string, { doseTaken: number; hasDose: boolean; targetDose: number | null; unit: string | null }> = {};

  entries.forEach((entry) => {
    const parsedDate = parseDate(entry.date);

    if (!parsedDate) {
      return;
    }

    const key = toDateKey(parsedDate);
    const existing = map[key] ?? {
      doseTaken: 0,
      hasDose: false,
      targetDose: null,
      unit: null,
    };

    const sanitizedDose = sanitizeDose(entry.doseTaken);
    if (sanitizedDose !== null) {
      existing.doseTaken += sanitizedDose;
      existing.hasDose = true;
    }

    const sanitizedTarget = sanitizeDose(entry.targetDose);
    if (sanitizedTarget !== null) {
      existing.targetDose = sanitizedTarget;
    }

    if (typeof entry.unit === 'string' && entry.unit.trim().length > 0) {
      existing.unit = entry.unit.trim();
    }

    map[key] = existing;
  });

  const normalized: Record<string, AggregatedDayEntry> = {};

  Object.entries(map).forEach(([key, value]) => {
    normalized[key] = {
      doseTaken: value.hasDose ? value.doseTaken : null,
      targetDose: value.targetDose,
      unit: value.unit,
    };
  });

  return normalized;
};

export const resolveDayStatus = (params: {
  isFuture: boolean;
  doseTaken: number | null;
  targetDose: number | null;
}): RollingCalendarDayStatus => {
  const { isFuture, doseTaken, targetDose } = params;

  if (isFuture) {
    return 'future';
  }

  if (doseTaken === null) {
    return 'empty';
  }

  if (targetDose === null) {
    return 'logged';
  }

  if (doseTaken > targetDose) {
    return 'warning';
  }

  return 'adherent';
};

export const buildRollingCalendarWeekDayStates = (
  options: BuildRollingCalendarWeekDayStatesOptions = {}
): RollingCalendarDayState[] => {
  const {
    entries = [],
    anchorDate = new Date(),
    now = new Date(),
    weekOffset = 0,
    weekStartsOn = 0,
    defaultTargetDose = null,
    defaultUnit,
  } = options;

  const normalizedNow = startOfDay(now);
  const aggregated = aggregateEntriesByDate(entries);
  const weekDates = buildCalendarWeekDates(anchorDate, weekOffset, weekStartsOn);

  return weekDates.map((date) => {
    const normalizedDate = startOfDay(date);
    const key = toDateKey(normalizedDate);
    const dayEntry = aggregated[key];

    const doseTaken = dayEntry?.doseTaken ?? null;
    const targetDose = dayEntry?.targetDose ?? sanitizeDose(defaultTargetDose);
    const unit = dayEntry?.unit ?? (typeof defaultUnit === 'string' && defaultUnit.trim().length > 0 ? defaultUnit.trim() : null);

    const isFuture = normalizedDate.getTime() > normalizedNow.getTime();
    const isToday = isSameCalendarDay(normalizedDate, normalizedNow);
    const isOverTarget = doseTaken !== null && targetDose !== null && doseTaken > targetDose;
    const isAdherent = doseTaken !== null && targetDose !== null && doseTaken <= targetDose;

    return {
      key,
      date: normalizedDate,
      dayLabel: DAY_LABELS[normalizedDate.getDay()],
      dateLabel: `${normalizedDate.getDate()}`.padStart(2, '0'),
      doseTaken,
      targetDose,
      unit,
      isToday,
      isFuture,
      isOverTarget,
      isAdherent,
      status: resolveDayStatus({
        isFuture,
        doseTaken,
        targetDose,
      }),
    };
  });
};

export const formatDoseAmount = (value: number | null, precision = 1): string => {
  if (value === null) {
    return '--';
  }

  return value.toFixed(precision);
};
