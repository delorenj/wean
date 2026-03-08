export const TAPER_MILESTONES = [25, 50, 75, 100] as const;

export type TaperMilestone = (typeof TAPER_MILESTONES)[number];
export type TaperStrategy = 'linear' | 'stepped' | 'percentage';

export interface TaperStrategyConfig {
  stepIntervalDays: number;
  percentageReductionPerStep: number | null;
  requiredPercentageReductionPerStep: number | null;
}

export interface TaperDailyTarget {
  day: number;
  dateISO: string;
  targetDose: number;
  isAdjustmentDay: boolean;
  milestones: TaperMilestone[];
  progressPercentage: number;
}

export interface TaperWeeklyTarget {
  week: number;
  startDay: number;
  endDay: number;
  startDateISO: string;
  endDateISO: string;
  averageTargetDose: number;
  startDose: number;
  endDose: number;
}

export interface GenerateTaperScheduleInput {
  currentDose: number;
  targetDose: number;
  timelineDays: number;
  strategy: TaperStrategy;
  startDate?: Date;
  stepIntervalDays?: number;
  percentageReductionPerStep?: number;
}

export interface GeneratedTaperSchedule {
  startDose: number;
  targetDose: number;
  timelineDays: number;
  totalDays: number;
  strategy: TaperStrategy;
  strategyConfig: TaperStrategyConfig;
  startDateISO: string;
  estimatedCompletionDateISO: string;
  dailyTargets: TaperDailyTarget[];
  weeklyTargets: TaperWeeklyTarget[];
  milestonesReached: TaperMilestone[];
}

export interface DoseDeviation {
  dateISO: string;
  targetDose: number;
  actualDose: number;
  delta: number;
  status: 'under' | 'on-track' | 'over';
}

const DAY_MS = 24 * 60 * 60 * 1000;
const DOSE_PRECISION = 100;
const DEFAULT_STEP_INTERVAL_DAYS = 7;
const DEFAULT_PERCENTAGE_REDUCTION_PER_STEP = 10;
const MIN_TIMELINE_DAYS = 2;

const toUTCStartOfDay = (date: Date): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));

const addUTCDays = (date: Date, days: number): Date =>
  new Date(date.getTime() + Math.trunc(days) * DAY_MS);

const toDateISO = (date: Date): string => date.toISOString().split('T')[0];

const clampDose = (value: number): number => Math.round(value * DOSE_PRECISION) / DOSE_PRECISION;

const clampPositive = (value: number, fallback: number): number => {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(0, value);
};

const clampProgress = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }

  if (value <= 0) {
    return 0;
  }

  if (value >= 100) {
    return 100;
  }

  return value;
};

const toSafeIntervalDays = (value?: number): number => {
  if (!Number.isFinite(value)) {
    return DEFAULT_STEP_INTERVAL_DAYS;
  }

  return Math.max(1, Math.floor(value as number));
};

const toSafePercentageStep = (value?: number): number => {
  if (!Number.isFinite(value)) {
    return DEFAULT_PERCENTAGE_REDUCTION_PER_STEP;
  }

  return Math.min(95, Math.max(0.1, value as number));
};

export const calculateTaperProgressPercentage = (
  startDose: number,
  targetDose: number,
  currentDose: number
): number => {
  const safeStart = clampPositive(startDose, 0);
  const safeTarget = clampPositive(targetDose, 0);
  const safeCurrent = clampPositive(currentDose, 0);

  if (safeStart <= safeTarget) {
    return safeCurrent <= safeTarget ? 100 : 0;
  }

  const reductionNeeded = safeStart - safeTarget;
  const reductionAchieved = safeStart - safeCurrent;

  return clampProgress((reductionAchieved / reductionNeeded) * 100);
};

const getMilestonesReachedInStep = (
  previousDose: number,
  nextDose: number,
  startDose: number,
  targetDose: number
): TaperMilestone[] => {
  const previousProgress = calculateTaperProgressPercentage(startDose, targetDose, previousDose);
  const nextProgress = calculateTaperProgressPercentage(startDose, targetDose, nextDose);

  return TAPER_MILESTONES.filter(
    (milestone) => previousProgress < milestone && nextProgress >= milestone
  );
};

const calculateRequiredPercentageReduction = (
  startDose: number,
  targetDose: number,
  steps: number
): number => {
  if (steps <= 0 || startDose <= 0 || targetDose <= 0 || targetDose >= startDose) {
    return 0;
  }

  const ratio = targetDose / startDose;
  const requiredBase = Math.pow(ratio, 1 / steps);
  const requiredReduction = (1 - requiredBase) * 100;

  return Math.min(95, Math.max(0, requiredReduction));
};

const generateLinearDose = (
  day: number,
  timelineDays: number,
  startDose: number,
  targetDose: number
): number => {
  const denominator = Math.max(1, timelineDays - 1);
  const progress = day / denominator;
  return startDose - (startDose - targetDose) * progress;
};

const generateSteppedDose = (
  day: number,
  timelineDays: number,
  startDose: number,
  targetDose: number,
  stepIntervalDays: number
): number => {
  const totalStepEvents = Math.max(1, Math.ceil((timelineDays - 1) / stepIntervalDays));
  const stepIndex = Math.min(totalStepEvents, Math.floor(day / stepIntervalDays));
  const progress = stepIndex / totalStepEvents;
  return startDose - (startDose - targetDose) * progress;
};

const generatePercentageDose = (
  day: number,
  timelineDays: number,
  startDose: number,
  targetDose: number,
  stepIntervalDays: number,
  configuredPercentageReductionPerStep?: number
): { dose: number; percentageReductionPerStep: number; requiredPercentageReductionPerStep: number } => {
  const totalStepEvents = Math.max(1, Math.ceil((timelineDays - 1) / stepIntervalDays));
  const stepIndex = Math.min(totalStepEvents, Math.floor(day / stepIntervalDays));
  const requiredPercentageReductionPerStep = calculateRequiredPercentageReduction(
    startDose,
    targetDose,
    totalStepEvents
  );

  const configuredReduction = toSafePercentageStep(configuredPercentageReductionPerStep);
  const percentageReductionPerStep =
    targetDose > 0
      ? Math.max(configuredReduction, requiredPercentageReductionPerStep)
      : configuredReduction;

  const dose = startDose * Math.pow(1 - percentageReductionPerStep / 100, stepIndex);

  return {
    dose,
    percentageReductionPerStep,
    requiredPercentageReductionPerStep,
  };
};

const buildWeeklyTargets = (dailyTargets: TaperDailyTarget[]): TaperWeeklyTarget[] => {
  const weeklyTargets: TaperWeeklyTarget[] = [];

  for (let offset = 0; offset < dailyTargets.length; offset += 7) {
    const weekSlice = dailyTargets.slice(offset, offset + 7);

    if (!weekSlice.length) {
      continue;
    }

    const week = Math.floor(offset / 7) + 1;
    const averageTargetDose =
      weekSlice.reduce((runningTotal, dayTarget) => runningTotal + dayTarget.targetDose, 0) / weekSlice.length;

    weeklyTargets.push({
      week,
      startDay: weekSlice[0].day,
      endDay: weekSlice[weekSlice.length - 1].day,
      startDateISO: weekSlice[0].dateISO,
      endDateISO: weekSlice[weekSlice.length - 1].dateISO,
      averageTargetDose: clampDose(averageTargetDose),
      startDose: weekSlice[0].targetDose,
      endDose: weekSlice[weekSlice.length - 1].targetDose,
    });
  }

  return weeklyTargets;
};

export const getTargetDoseForDate = (
  plan: Pick<GeneratedTaperSchedule, 'startDateISO' | 'dailyTargets'>,
  date: Date
): number | null => {
  if (!plan.dailyTargets.length || !(date instanceof Date) || Number.isNaN(date.getTime())) {
    return null;
  }

  const startDate = new Date(plan.startDateISO);

  if (Number.isNaN(startDate.getTime())) {
    return null;
  }

  const dayOffset = Math.floor((toUTCStartOfDay(date).getTime() - toUTCStartOfDay(startDate).getTime()) / DAY_MS);

  if (dayOffset < 0 || dayOffset >= plan.dailyTargets.length) {
    return null;
  }

  return plan.dailyTargets[dayOffset].targetDose;
};

export const compareActualDoseToTarget = (
  actualDose: number,
  targetDose: number,
  tolerancePercent = 10
): DoseDeviation => {
  const safeActualDose = clampPositive(actualDose, 0);
  const safeTargetDose = clampPositive(targetDose, 0);
  const tolerance = Math.max(0, (safeTargetDose * Math.max(0, tolerancePercent)) / 100);
  const delta = clampDose(safeActualDose - safeTargetDose);

  if (Math.abs(delta) <= tolerance) {
    return {
      dateISO: '',
      targetDose: safeTargetDose,
      actualDose: safeActualDose,
      delta,
      status: 'on-track',
    };
  }

  return {
    dateISO: '',
    targetDose: safeTargetDose,
    actualDose: safeActualDose,
    delta,
    status: delta > 0 ? 'over' : 'under',
  };
};

export const generateTaperSchedule = (
  input: GenerateTaperScheduleInput
): GeneratedTaperSchedule => {
  const safeCurrentDose = clampPositive(input.currentDose, Number.NaN);
  const safeTargetDose = clampPositive(input.targetDose, Number.NaN);

  if (!Number.isFinite(safeCurrentDose) || safeCurrentDose <= 0) {
    throw new Error('Current dose must be greater than 0.');
  }

  if (!Number.isFinite(safeTargetDose) || safeTargetDose < 0) {
    throw new Error('Target dose must be a non-negative number.');
  }

  if (safeTargetDose >= safeCurrentDose) {
    throw new Error('Target dose must be lower than current dose.');
  }

  const safeTimelineDays =
    Number.isFinite(input.timelineDays) && Math.floor(input.timelineDays) >= MIN_TIMELINE_DAYS
      ? Math.floor(input.timelineDays)
      : MIN_TIMELINE_DAYS;

  const startDate =
    input.startDate instanceof Date && !Number.isNaN(input.startDate.getTime())
      ? toUTCStartOfDay(input.startDate)
      : toUTCStartOfDay(new Date());

  const stepIntervalDays = toSafeIntervalDays(input.stepIntervalDays);

  const dailyTargets: TaperDailyTarget[] = [];
  const reachedMilestones = new Set<TaperMilestone>();

  let previousDose = clampDose(safeCurrentDose);
  let configuredPercentageReductionPerStep: number | null = null;
  let requiredPercentageReductionPerStep: number | null = null;

  for (let day = 0; day < safeTimelineDays; day += 1) {
    let targetDoseForDay = safeCurrentDose;

    if (input.strategy === 'linear') {
      targetDoseForDay = generateLinearDose(day, safeTimelineDays, safeCurrentDose, safeTargetDose);
    } else if (input.strategy === 'stepped') {
      targetDoseForDay = generateSteppedDose(
        day,
        safeTimelineDays,
        safeCurrentDose,
        safeTargetDose,
        stepIntervalDays
      );
    } else {
      const percentageDose = generatePercentageDose(
        day,
        safeTimelineDays,
        safeCurrentDose,
        safeTargetDose,
        stepIntervalDays,
        input.percentageReductionPerStep
      );

      targetDoseForDay = percentageDose.dose;
      configuredPercentageReductionPerStep = percentageDose.percentageReductionPerStep;
      requiredPercentageReductionPerStep = percentageDose.requiredPercentageReductionPerStep;
    }

    if (day === safeTimelineDays - 1) {
      targetDoseForDay = safeTargetDose;
    }

    targetDoseForDay = clampDose(Math.max(safeTargetDose, targetDoseForDay));

    const milestones = getMilestonesReachedInStep(
      previousDose,
      targetDoseForDay,
      safeCurrentDose,
      safeTargetDose
    );

    milestones.forEach((milestone) => reachedMilestones.add(milestone));

    const progressPercentage = calculateTaperProgressPercentage(
      safeCurrentDose,
      safeTargetDose,
      targetDoseForDay
    );

    dailyTargets.push({
      day,
      dateISO: toDateISO(addUTCDays(startDate, day)),
      targetDose: targetDoseForDay,
      isAdjustmentDay:
        day === 0 ||
        day === safeTimelineDays - 1 ||
        input.strategy === 'linear' ||
        day % stepIntervalDays === 0,
      milestones,
      progressPercentage,
    });

    previousDose = targetDoseForDay;
  }

  const weeklyTargets = buildWeeklyTargets(dailyTargets);

  return {
    startDose: safeCurrentDose,
    targetDose: safeTargetDose,
    timelineDays: safeTimelineDays,
    totalDays: safeTimelineDays - 1,
    strategy: input.strategy,
    strategyConfig: {
      stepIntervalDays,
      percentageReductionPerStep:
        input.strategy === 'percentage' ? configuredPercentageReductionPerStep : null,
      requiredPercentageReductionPerStep:
        input.strategy === 'percentage' ? requiredPercentageReductionPerStep : null,
    },
    startDateISO: startDate.toISOString(),
    estimatedCompletionDateISO: addUTCDays(startDate, safeTimelineDays - 1).toISOString(),
    dailyTargets,
    weeklyTargets,
    milestonesReached: TAPER_MILESTONES.filter((milestone) => reachedMilestones.has(milestone)),
  };
};
