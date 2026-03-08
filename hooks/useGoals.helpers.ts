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
