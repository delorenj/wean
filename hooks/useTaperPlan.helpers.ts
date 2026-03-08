export const TAPER_MILESTONES = [25, 50, 75, 100] as const;

export type TaperMilestone = (typeof TAPER_MILESTONES)[number];
export type TaperSpeed = 'aggressive' | 'moderate' | 'gentle';

export interface TaperStrategyConfig {
  reductionPercent: number;
  reductionEveryDays: number;
}

export interface TaperScheduleStep {
  step: number;
  day: number;
  dateISO: string;
  dose: number;
  milestones: TaperMilestone[];
}

export interface GenerateTaperScheduleInput {
  currentDose: number;
  targetDose?: number;
  taperSpeed: TaperSpeed;
  startDate?: Date;
  maxSteps?: number;
}

export interface GeneratedTaperSchedule {
  startDose: number;
  targetDose: number;
  taperSpeed: TaperSpeed;
  reductionPercent: number;
  reductionEveryDays: number;
  startDateISO: string;
  estimatedCompletionDateISO: string;
  totalDays: number;
  schedule: TaperScheduleStep[];
  milestonesReached: TaperMilestone[];
}

const DEFAULT_TARGET_DOSE = 0;
const DEFAULT_MAX_STEPS = 500;
const DOSE_PRECISION = 100;

const toUTCStartOfDay = (date: Date): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));

const addUTCDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + Math.trunc(days));
  return next;
};

const clampDose = (value: number): number => Math.round(value * DOSE_PRECISION) / DOSE_PRECISION;

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

export const getTaperStrategyConfig = (speed: TaperSpeed): TaperStrategyConfig => {
  if (speed === 'aggressive') {
    return {
      reductionPercent: 10,
      reductionEveryDays: 3,
    };
  }

  if (speed === 'gentle') {
    return {
      reductionPercent: 5,
      reductionEveryDays: 7,
    };
  }

  return {
    reductionPercent: 10,
    reductionEveryDays: 7,
  };
};

export const calculateTaperProgressPercentage = (
  startDose: number,
  targetDose: number,
  currentDose: number
): number => {
  const safeStart = Number.isFinite(startDose) ? Math.max(0, startDose) : 0;
  const safeTarget = Number.isFinite(targetDose) ? Math.max(0, targetDose) : 0;
  const safeCurrent = Number.isFinite(currentDose) ? Math.max(0, currentDose) : 0;

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

export const generateTaperSchedule = (
  input: GenerateTaperScheduleInput
): GeneratedTaperSchedule => {
  const safeCurrentDose = Number.isFinite(input.currentDose) ? Math.max(0, input.currentDose) : NaN;
  const safeTargetDose = Number.isFinite(input.targetDose)
    ? Math.max(0, input.targetDose as number)
    : DEFAULT_TARGET_DOSE;

  if (!Number.isFinite(safeCurrentDose) || safeCurrentDose <= 0) {
    throw new Error('Current dose must be greater than 0.');
  }

  if (!Number.isFinite(safeTargetDose) || safeTargetDose < 0) {
    throw new Error('Target dose must be a non-negative number.');
  }

  if (safeTargetDose >= safeCurrentDose) {
    throw new Error('Target dose must be lower than current dose.');
  }

  const startDate =
    input.startDate instanceof Date && !Number.isNaN(input.startDate.getTime())
      ? toUTCStartOfDay(input.startDate)
      : toUTCStartOfDay(new Date());

  const maxSteps =
    Number.isInteger(input.maxSteps) && (input.maxSteps as number) > 1
      ? (input.maxSteps as number)
      : DEFAULT_MAX_STEPS;

  const strategyConfig = getTaperStrategyConfig(input.taperSpeed);
  const schedule: TaperScheduleStep[] = [];
  const reachedMilestones = new Set<TaperMilestone>();

  let currentDose = clampDose(safeCurrentDose);

  schedule.push({
    step: 1,
    day: 0,
    dateISO: startDate.toISOString().split('T')[0],
    dose: currentDose,
    milestones: [],
  });

  let stepCounter = 1;

  while (currentDose > safeTargetDose && stepCounter < maxSteps) {
    const rawNextDose = currentDose * (1 - strategyConfig.reductionPercent / 100);
    let nextDose = clampDose(Math.max(safeTargetDose, rawNextDose));

    if (nextDose >= currentDose) {
      const minDrop = clampDose(currentDose - 0.01);
      nextDose = Math.max(safeTargetDose, minDrop);
    }

    if (nextDose < safeTargetDose) {
      nextDose = safeTargetDose;
    }

    const milestones = getMilestonesReachedInStep(
      currentDose,
      nextDose,
      safeCurrentDose,
      safeTargetDose
    );

    milestones.forEach((milestone) => {
      reachedMilestones.add(milestone);
    });

    const day = strategyConfig.reductionEveryDays * stepCounter;
    const stepDate = addUTCDays(startDate, day);

    schedule.push({
      step: stepCounter + 1,
      day,
      dateISO: stepDate.toISOString().split('T')[0],
      dose: nextDose,
      milestones,
    });

    currentDose = nextDose;
    stepCounter += 1;
  }

  const lastStep = schedule[schedule.length - 1];

  if (lastStep.dose !== safeTargetDose) {
    throw new Error('Unable to generate taper schedule with provided values.');
  }

  return {
    startDose: safeCurrentDose,
    targetDose: safeTargetDose,
    taperSpeed: input.taperSpeed,
    reductionPercent: strategyConfig.reductionPercent,
    reductionEveryDays: strategyConfig.reductionEveryDays,
    startDateISO: startDate.toISOString(),
    estimatedCompletionDateISO: new Date(`${lastStep.dateISO}T00:00:00.000Z`).toISOString(),
    totalDays: lastStep.day,
    schedule,
    milestonesReached: TAPER_MILESTONES.filter((milestone) => reachedMilestones.has(milestone)),
  };
};
