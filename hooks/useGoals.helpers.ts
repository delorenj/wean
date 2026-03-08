export const GOAL_MILESTONE_THRESHOLDS = [25, 50, 75, 100] as const;

export type GoalMilestoneThreshold = (typeof GOAL_MILESTONE_THRESHOLDS)[number];

export interface GoalProgressInput {
  startDose: number;
  targetDose: number;
  currentDose: number;
}

export interface GoalMilestoneState {
  threshold: GoalMilestoneThreshold;
  isReached: boolean;
  isCelebrated: boolean;
}

export interface GoalDateMilestone {
  id: string;
  label: string;
  targetDose: number;
  targetDateISO: string;
  achieved: boolean;
  achievedAtISO?: string | null;
  actualDose?: number | null;
}

export interface GenerateWeeklyMilestonesInput {
  startDose: number;
  targetDose: number;
  startDate: Date;
  targetDate: Date;
}

export interface ReconcileMilestonesInput {
  milestones: GoalDateMilestone[];
  doseTotalsByDate: Record<string, number>;
  today?: Date;
}

export interface ReconcileMilestonesResult {
  milestones: GoalDateMilestone[];
  newlyAchievedMilestones: GoalDateMilestone[];
}

const DAY_MS = 24 * 60 * 60 * 1000;

const clampPercentage = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }

  if (value <= 0) {
    return 0;
  }

  if (value >= 100) {
    return 100;
  }

  return Math.round(value * 10) / 10;
};

const normalizeDose = (dose: number): number => {
  if (!Number.isFinite(dose)) {
    return 0;
  }

  return Math.round(Math.max(0, dose) * 1000) / 1000;
};

const toUTCStartOfDay = (date: Date): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));

export const toDateISO = (date: Date): string => toUTCStartOfDay(date).toISOString().split('T')[0];

export const calculateProgressPercentage = ({
  startDose,
  targetDose,
  currentDose,
}: GoalProgressInput): number => {
  const safeStart = Number.isFinite(startDose) ? Math.max(0, startDose) : 0;
  const safeTarget = Number.isFinite(targetDose) ? Math.max(0, targetDose) : 0;
  const safeCurrent = Number.isFinite(currentDose) ? Math.max(0, currentDose) : 0;

  if (safeStart <= safeTarget) {
    return safeCurrent <= safeTarget ? 100 : 0;
  }

  const reductionNeeded = safeStart - safeTarget;
  const reductionAchieved = safeStart - safeCurrent;

  return clampPercentage((reductionAchieved / reductionNeeded) * 100);
};

export const getReachedMilestones = (progressPercentage: number): GoalMilestoneThreshold[] => {
  const safeProgress = clampPercentage(progressPercentage);

  return GOAL_MILESTONE_THRESHOLDS.filter((threshold) => safeProgress >= threshold);
};

export const buildMilestoneStates = (
  progressPercentage: number,
  celebratedMilestones: number[] = []
): GoalMilestoneState[] => {
  const reachedSet = new Set(getReachedMilestones(progressPercentage));
  const celebratedSet = new Set(celebratedMilestones);

  return GOAL_MILESTONE_THRESHOLDS.map((threshold) => ({
    threshold,
    isReached: reachedSet.has(threshold),
    isCelebrated: celebratedSet.has(threshold),
  }));
};

export const findHighestUncelebratedMilestone = (
  progressPercentage: number,
  celebratedMilestones: number[] = []
): GoalMilestoneThreshold | null => {
  const celebratedSet = new Set(celebratedMilestones);
  const candidates = getReachedMilestones(progressPercentage).filter(
    (threshold) => !celebratedSet.has(threshold)
  );

  if (!candidates.length) {
    return null;
  }

  return candidates[candidates.length - 1];
};

export const generateWeeklyMilestones = ({
  startDose,
  targetDose,
  startDate,
  targetDate,
}: GenerateWeeklyMilestonesInput): GoalDateMilestone[] => {
  if (!(startDate instanceof Date) || Number.isNaN(startDate.getTime())) {
    return [];
  }

  if (!(targetDate instanceof Date) || Number.isNaN(targetDate.getTime())) {
    return [];
  }

  const safeStartDate = toUTCStartOfDay(startDate);
  const safeTargetDate = toUTCStartOfDay(targetDate);
  const totalDays = Math.max(1, Math.ceil((safeTargetDate.getTime() - safeStartDate.getTime()) / DAY_MS));
  const checkpointCount = Math.max(1, Math.ceil(totalDays / 7));

  const safeStartDose = normalizeDose(startDose);
  const safeTargetDose = normalizeDose(targetDose);
  const reductionRange = safeStartDose - safeTargetDose;

  return Array.from({ length: checkpointCount }, (_, index) => {
    const checkpoint = index + 1;
    const checkpointRatio = checkpoint / checkpointCount;
    const checkpointDayOffset = Math.min(totalDays, checkpoint * 7);
    const checkpointDate = new Date(safeStartDate.getTime() + checkpointDayOffset * DAY_MS);
    const targetDoseAtCheckpoint = safeStartDose - reductionRange * checkpointRatio;
    const targetDateISO = toDateISO(checkpointDate);

    return {
      id: `milestone-${checkpoint}-${targetDateISO}`,
      label: `Week ${checkpoint}`,
      targetDose: normalizeDose(targetDoseAtCheckpoint),
      targetDateISO,
      achieved: false,
      achievedAtISO: null,
      actualDose: null,
    };
  });
};

export const getLatestDoseOnOrBeforeDate = (
  targetDateISO: string,
  doseTotalsByDate: Record<string, number>
): number | null => {
  const matchingDate = Object.keys(doseTotalsByDate)
    .filter((dateISO) => dateISO <= targetDateISO)
    .sort()
    .pop();

  if (!matchingDate) {
    return null;
  }

  const dose = doseTotalsByDate[matchingDate];

  return Number.isFinite(dose) ? normalizeDose(dose) : null;
};

export const reconcileMilestoneAchievements = ({
  milestones,
  doseTotalsByDate,
  today = new Date(),
}: ReconcileMilestonesInput): ReconcileMilestonesResult => {
  const todayISO = toDateISO(today);
  const newlyAchievedMilestones: GoalDateMilestone[] = [];

  const nextMilestones = milestones.map((milestone) => {
    const baseMilestone: GoalDateMilestone = {
      ...milestone,
      targetDose: normalizeDose(milestone.targetDose),
      achieved: Boolean(milestone.achieved),
      achievedAtISO: milestone.achievedAtISO || null,
      actualDose: Number.isFinite(milestone.actualDose) ? normalizeDose(milestone.actualDose as number) : null,
    };

    if (baseMilestone.targetDateISO > todayISO) {
      return baseMilestone;
    }

    const actualDose = getLatestDoseOnOrBeforeDate(baseMilestone.targetDateISO, doseTotalsByDate);

    if (actualDose === null) {
      return baseMilestone;
    }

    if (!baseMilestone.achieved && actualDose <= baseMilestone.targetDose) {
      const achievedMilestone: GoalDateMilestone = {
        ...baseMilestone,
        achieved: true,
        achievedAtISO: todayISO,
        actualDose,
      };

      newlyAchievedMilestones.push(achievedMilestone);
      return achievedMilestone;
    }

    return {
      ...baseMilestone,
      actualDose,
    };
  });

  return {
    milestones: nextMilestones,
    newlyAchievedMilestones,
  };
};
