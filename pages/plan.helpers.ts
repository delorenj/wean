export type TaperStrategy = 'gradual' | 'aggressive' | 'custom';

export interface SmartTaperPlanInput {
  substance: string;
  currentDose: number;
  targetDose: number;
  timelineDays: number;
  unit: string;
  strategy: TaperStrategy;
  reductionPercent: number;
  reductionEveryDays: number;
  startDateISO?: string;
}

export interface SmartTaperDay {
  day: number;
  dateISO: string;
  targetDose: number;
  isDoseChangeDay: boolean;
}

export interface SmartTaperPlan {
  id: string;
  substance: string;
  unit: string;
  strategy: TaperStrategy;
  currentDose: number;
  targetDose: number;
  timelineDays: number;
  reductionPercent: number;
  reductionEveryDays: number;
  createdAtISO: string;
  startDateISO: string;
  schedule: SmartTaperDay[];
}

export interface DoseComparison {
  actualDose: number;
  plannedDose: number;
  delta: number;
  status: 'under' | 'on-track' | 'over';
}

export interface DoseChangeReminder {
  day: number;
  dateISO: string;
  message: string;
  targetDose: number;
}

const clampToTwoDecimals = (value: number): number => Math.round(value * 100) / 100;

const toSafeDate = (value?: string): Date => {
  if (!value) {
    return new Date();
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date();
  }

  return parsed;
};

export const getStrategyDefaults = (strategy: TaperStrategy): Pick<SmartTaperPlanInput, 'reductionPercent' | 'reductionEveryDays'> => {
  if (strategy === 'aggressive') {
    return { reductionPercent: 10, reductionEveryDays: 7 };
  }

  if (strategy === 'custom') {
    return { reductionPercent: 7, reductionEveryDays: 5 };
  }

  return { reductionPercent: 5, reductionEveryDays: 7 };
};

const normalizeInput = (input: SmartTaperPlanInput): SmartTaperPlanInput => {
  if (!Number.isFinite(input.currentDose) || input.currentDose < 0) {
    throw new Error('Current dose must be a non-negative number');
  }

  if (!Number.isFinite(input.targetDose) || input.targetDose < 0) {
    throw new Error('Target dose must be a non-negative number');
  }

  if (input.targetDose > input.currentDose) {
    throw new Error('Target dose cannot be greater than current dose');
  }

  if (!Number.isInteger(input.timelineDays) || input.timelineDays < 2) {
    throw new Error('Timeline must be at least 2 days');
  }

  if (!Number.isFinite(input.reductionPercent) || input.reductionPercent <= 0 || input.reductionPercent >= 100) {
    throw new Error('Reduction percent must be between 0 and 100');
  }

  if (!Number.isInteger(input.reductionEveryDays) || input.reductionEveryDays < 1) {
    throw new Error('Reduction interval must be at least 1 day');
  }

  const unit = input.unit?.trim();
  const substance = input.substance?.trim();

  return {
    ...input,
    timelineDays: Math.floor(input.timelineDays),
    reductionEveryDays: Math.floor(input.reductionEveryDays),
    unit: unit?.length ? unit : 'g',
    substance: substance?.length ? substance : 'Kratom',
  };
};

export const generateSmartTaperPlan = (input: SmartTaperPlanInput): SmartTaperPlan => {
  const normalized = normalizeInput(input);

  const {
    currentDose,
    targetDose,
    timelineDays,
    reductionPercent,
    reductionEveryDays,
    strategy,
    unit,
    substance,
  } = normalized;

  const startDate = toSafeDate(normalized.startDateISO);
  const totalReduction = currentDose - targetDose;
  const lastTimelineIndex = timelineDays - 1;

  const schedule: SmartTaperDay[] = [];

  for (let day = 1; day <= timelineDays; day += 1) {
    const index = day - 1;
    const reductionsApplied = Math.floor(index / reductionEveryDays);

    const exponentialTarget = currentDose * Math.pow(1 - reductionPercent / 100, reductionsApplied);
    const linearSafetyTarget = currentDose - totalReduction * (index / lastTimelineIndex);

    const boundedTarget = Math.max(targetDose, Math.min(exponentialTarget, linearSafetyTarget));

    const dayDate = new Date(startDate);
    dayDate.setDate(startDate.getDate() + index);

    schedule.push({
      day,
      dateISO: dayDate.toISOString().split('T')[0],
      targetDose: clampToTwoDecimals(day === timelineDays ? targetDose : boundedTarget),
      isDoseChangeDay: day === 1 || index % reductionEveryDays === 0,
    });
  }

  const nowISO = new Date().toISOString();

  return {
    id: `plan-${nowISO}`,
    substance,
    unit,
    strategy,
    currentDose,
    targetDose,
    timelineDays,
    reductionPercent,
    reductionEveryDays,
    createdAtISO: nowISO,
    startDateISO: startDate.toISOString(),
    schedule,
  };
};

export const getPlanDayIndexForDate = (plan: SmartTaperPlan, date: Date): number => {
  const start = new Date(plan.startDateISO);
  const startAtMidnight = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
  const dateAtMidnight = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

  const diffMs = dateAtMidnight - startAtMidnight;
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffDays <= 0) {
    return 0;
  }

  if (diffDays >= plan.schedule.length - 1) {
    return plan.schedule.length - 1;
  }

  return diffDays;
};

export const getPlannedDoseForDate = (plan: SmartTaperPlan, date: Date): number => {
  const index = getPlanDayIndexForDate(plan, date);
  return plan.schedule[index]?.targetDose ?? plan.targetDose;
};

export const compareActualToPlannedDose = (actualDose: number, plannedDose: number): DoseComparison => {
  const safeActualDose = Number.isFinite(actualDose) ? Math.max(0, actualDose) : 0;
  const safePlannedDose = Number.isFinite(plannedDose) ? Math.max(0, plannedDose) : 0;
  const delta = clampToTwoDecimals(safeActualDose - safePlannedDose);

  if (Math.abs(delta) <= 0.05) {
    return {
      actualDose: safeActualDose,
      plannedDose: safePlannedDose,
      delta,
      status: 'on-track',
    };
  }

  return {
    actualDose: safeActualDose,
    plannedDose: safePlannedDose,
    delta,
    status: delta > 0 ? 'over' : 'under',
  };
};

export const buildDoseChangeReminders = (
  plan: SmartTaperPlan,
  fromDate: Date,
  limit = 3
): DoseChangeReminder[] => {
  const fromDateISO = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate())
    .toISOString()
    .split('T')[0];

  return plan.schedule
    .filter((day, index) => {
      if (!day.isDoseChangeDay || index === 0) {
        return false;
      }

      return day.dateISO >= fromDateISO;
    })
    .slice(0, limit)
    .map((day) => ({
      day: day.day,
      dateISO: day.dateISO,
      targetDose: day.targetDose,
      message: `Dose change on ${day.dateISO}: new target ${day.targetDose}${plan.unit}`,
    }));
};
