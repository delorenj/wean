import { useCallback, useEffect, useMemo, useState } from 'react';
import { Timestamp, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { Model, ModelConverter } from '../models/Model';
import { useFirebase } from '../context/firebaseConfig';
import useFireauth from './useFireauth';
import { useDoses } from './useDoses';
import {
  compareActualDoseToTarget,
  DoseDeviation,
  generateTaperSchedule,
  GeneratedTaperSchedule,
  getTargetDoseForDate,
  TaperDailyTarget,
  TaperMilestone,
  TaperStrategy,
  TaperStrategyConfig,
  TaperWeeklyTarget,
} from './useTaperPlan.helpers';

const TAPER_PLAN_DOC_ID = 'active-plan';
const DAY_MS = 24 * 60 * 60 * 1000;

export interface TaperPlanRegeneration {
  atISO: string;
  reason: string;
  actualDose: number;
  remainingDays: number;
}

export interface TaperPlan extends Model {
  id?: string;
  currentDose: number;
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
  regenerationCount: number;
  regenerationHistory: TaperPlanRegeneration[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface SaveTaperPlanInput {
  currentDose: number;
  targetDose: number;
  timelineDays: number;
  strategy: TaperStrategy;
  startDate?: Date;
  stepIntervalDays?: number;
  percentageReductionPerStep?: number;
}

export interface RegenerateTaperPlanInput {
  actualDose: number;
  asOfDate?: Date;
  remainingDays?: number;
  reason?: string;
}

export interface DatedDoseDeviation extends DoseDeviation {
  dateISO: string;
}

export interface UseTaperPlanResult {
  plan: TaperPlan | null;
  isLoading: boolean;
  error: string | null;
  adherenceEntries: DatedDoseDeviation[];
  savePlan: (input: SaveTaperPlanInput) => Promise<TaperPlan>;
  regeneratePlanFromDeviation: (input: RegenerateTaperPlanInput) => Promise<TaperPlan>;
  getTargetForDate: (date: Date) => number | null;
  getDeviationForDate: (date: Date, actualDose: number) => DatedDoseDeviation | null;
  clearPlan: () => Promise<void>;
}

const normalizeMilestones = (milestones?: number[]): TaperMilestone[] => {
  if (!Array.isArray(milestones)) {
    return [];
  }

  return milestones
    .filter((milestone): milestone is TaperMilestone =>
      milestone === 25 || milestone === 50 || milestone === 75 || milestone === 100
    )
    .sort((left, right) => left - right);
};

const normalizeDailyTargets = (dailyTargets?: TaperDailyTarget[]): TaperDailyTarget[] => {
  if (!Array.isArray(dailyTargets)) {
    return [];
  }

  return dailyTargets.map((target, index) => ({
    day: Number.isFinite(target?.day) ? target.day : index,
    dateISO: typeof target?.dateISO === 'string' ? target.dateISO : '',
    targetDose: Number.isFinite(target?.targetDose) ? target.targetDose : 0,
    isAdjustmentDay: Boolean(target?.isAdjustmentDay),
    milestones: normalizeMilestones(target?.milestones),
    progressPercentage: Number.isFinite(target?.progressPercentage) ? target.progressPercentage : 0,
  }));
};

const normalizeWeeklyTargets = (weeklyTargets?: TaperWeeklyTarget[]): TaperWeeklyTarget[] => {
  if (!Array.isArray(weeklyTargets)) {
    return [];
  }

  return weeklyTargets.map((target, index) => ({
    week: Number.isFinite(target?.week) ? target.week : index + 1,
    startDay: Number.isFinite(target?.startDay) ? target.startDay : 0,
    endDay: Number.isFinite(target?.endDay) ? target.endDay : 0,
    startDateISO: typeof target?.startDateISO === 'string' ? target.startDateISO : '',
    endDateISO: typeof target?.endDateISO === 'string' ? target.endDateISO : '',
    averageTargetDose: Number.isFinite(target?.averageTargetDose) ? target.averageTargetDose : 0,
    startDose: Number.isFinite(target?.startDose) ? target.startDose : 0,
    endDose: Number.isFinite(target?.endDose) ? target.endDose : 0,
  }));
};

const normalizeRegenerationHistory = (history?: TaperPlanRegeneration[]): TaperPlanRegeneration[] => {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .map((entry) => ({
      atISO: typeof entry?.atISO === 'string' ? entry.atISO : '',
      reason: typeof entry?.reason === 'string' ? entry.reason : 'deviation',
      actualDose: Number.isFinite(entry?.actualDose) ? entry.actualDose : 0,
      remainingDays: Number.isFinite(entry?.remainingDays) ? entry.remainingDays : 0,
    }))
    .filter((entry) => entry.atISO);
};

const taperPlanConverter: ModelConverter = {
  toFirestore: (plan: TaperPlan) => ({
    currentDose: plan.currentDose,
    targetDose: plan.targetDose,
    timelineDays: plan.timelineDays,
    totalDays: plan.totalDays,
    strategy: plan.strategy,
    strategyConfig: {
      stepIntervalDays: plan.strategyConfig.stepIntervalDays,
      percentageReductionPerStep: plan.strategyConfig.percentageReductionPerStep,
      requiredPercentageReductionPerStep: plan.strategyConfig.requiredPercentageReductionPerStep,
    },
    startDateISO: plan.startDateISO,
    estimatedCompletionDateISO: plan.estimatedCompletionDateISO,
    dailyTargets: normalizeDailyTargets(plan.dailyTargets),
    weeklyTargets: normalizeWeeklyTargets(plan.weeklyTargets),
    milestonesReached: normalizeMilestones(plan.milestonesReached),
    regenerationCount: plan.regenerationCount,
    regenerationHistory: normalizeRegenerationHistory(plan.regenerationHistory),
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
  }),
  fromFirestore: (snapshot: any, options: any): TaperPlan => {
    const data = snapshot.data(options);

    return {
      id: snapshot.id,
      currentDose: Number.isFinite(data.currentDose) ? data.currentDose : 0,
      targetDose: Number.isFinite(data.targetDose) ? data.targetDose : 0,
      timelineDays: Number.isFinite(data.timelineDays) ? data.timelineDays : 2,
      totalDays: Number.isFinite(data.totalDays) ? data.totalDays : 1,
      strategy:
        data.strategy === 'linear' || data.strategy === 'stepped' || data.strategy === 'percentage'
          ? data.strategy
          : 'linear',
      strategyConfig: {
        stepIntervalDays: Number.isFinite(data?.strategyConfig?.stepIntervalDays)
          ? data.strategyConfig.stepIntervalDays
          : 7,
        percentageReductionPerStep: Number.isFinite(data?.strategyConfig?.percentageReductionPerStep)
          ? data.strategyConfig.percentageReductionPerStep
          : null,
        requiredPercentageReductionPerStep: Number.isFinite(
          data?.strategyConfig?.requiredPercentageReductionPerStep
        )
          ? data.strategyConfig.requiredPercentageReductionPerStep
          : null,
      },
      startDateISO: typeof data.startDateISO === 'string' ? data.startDateISO : '',
      estimatedCompletionDateISO:
        typeof data.estimatedCompletionDateISO === 'string' ? data.estimatedCompletionDateISO : '',
      dailyTargets: normalizeDailyTargets(data.dailyTargets),
      weeklyTargets: normalizeWeeklyTargets(data.weeklyTargets),
      milestonesReached: normalizeMilestones(data.milestonesReached),
      regenerationCount: Number.isFinite(data.regenerationCount) ? data.regenerationCount : 0,
      regenerationHistory: normalizeRegenerationHistory(data.regenerationHistory),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  },
};

const mapGeneratedPlanToFirestoreModel = (
  generatedPlan: GeneratedTaperSchedule,
  existingPlan: TaperPlan | null,
  regenerationEntry?: TaperPlanRegeneration
): TaperPlan => {
  const now = Timestamp.now();

  return {
    id: TAPER_PLAN_DOC_ID,
    currentDose: generatedPlan.startDose,
    targetDose: generatedPlan.targetDose,
    timelineDays: generatedPlan.timelineDays,
    totalDays: generatedPlan.totalDays,
    strategy: generatedPlan.strategy,
    strategyConfig: generatedPlan.strategyConfig,
    startDateISO: generatedPlan.startDateISO,
    estimatedCompletionDateISO: generatedPlan.estimatedCompletionDateISO,
    dailyTargets: generatedPlan.dailyTargets,
    weeklyTargets: generatedPlan.weeklyTargets,
    milestonesReached: generatedPlan.milestonesReached,
    regenerationCount: regenerationEntry ? (existingPlan?.regenerationCount || 0) + 1 : 0,
    regenerationHistory: regenerationEntry
      ? [...(existingPlan?.regenerationHistory || []), regenerationEntry].slice(-20)
      : [],
    createdAt: existingPlan?.createdAt || now,
    updatedAt: now,
  };
};

const toDateISOFromTimestamp = (seconds?: number, nanoseconds?: number): string | null => {
  if (!Number.isFinite(seconds)) {
    return null;
  }

  const date = new Date((seconds as number) * 1000 + Math.floor((nanoseconds || 0) / 1_000_000));

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().split('T')[0];
};

const toUTCStartOfDay = (date: Date): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));

const getElapsedDays = (startDateISO: string, asOfDate: Date): number => {
  const startDate = new Date(startDateISO);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(asOfDate.getTime())) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor((toUTCStartOfDay(asOfDate).getTime() - toUTCStartOfDay(startDate).getTime()) / DAY_MS)
  );
};

export const useTaperPlan = (enabled = true): UseTaperPlanResult => {
  const { user } = useFireauth();
  const { db } = useFirebase();
  const { doseHistory } = useDoses();

  const [plan, setPlan] = useState<TaperPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setPlan(null);
      setIsLoading(false);
      return;
    }

    if (!db || !user) {
      setPlan(null);
      setIsLoading(false);
      return;
    }

    const taperPlanRef = doc(db, `taper-plans-${user.uid}`, TAPER_PLAN_DOC_ID).withConverter(
      taperPlanConverter
    );

    const unsubscribe = onSnapshot(
      taperPlanRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setPlan(null);
          setIsLoading(false);
          return;
        }

        setPlan(snapshot.data());
        setIsLoading(false);
      },
      (snapshotError) => {
        setError(snapshotError instanceof Error ? snapshotError.message : 'Failed to load taper plan');
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [db, enabled, user]);

  const actualDoseByDate = useMemo(() => {
    const mapped: Record<string, number> = {};

    doseHistory.forEach((dose) => {
      const dateISO = toDateISOFromTimestamp(dose.date?.seconds, dose.date?.nanoseconds);

      if (!dateISO) {
        return;
      }

      const runningDose = mapped[dateISO] || 0;
      mapped[dateISO] = runningDose + (Number.isFinite(dose.amount) ? dose.amount : 0);
    });

    return mapped;
  }, [doseHistory]);

  const adherenceEntries = useMemo<DatedDoseDeviation[]>(() => {
    if (!plan) {
      return [];
    }

    return plan.dailyTargets
      .map((dailyTarget) => {
        const actualDose = actualDoseByDate[dailyTarget.dateISO];

        if (!Number.isFinite(actualDose)) {
          return null;
        }

        const comparison = compareActualDoseToTarget(actualDose, dailyTarget.targetDose);

        return {
          ...comparison,
          dateISO: dailyTarget.dateISO,
        };
      })
      .filter((entry): entry is DatedDoseDeviation => Boolean(entry));
  }, [actualDoseByDate, plan]);

  const savePlan = useCallback(
    async (input: SaveTaperPlanInput): Promise<TaperPlan> => {
      if (!enabled) {
        throw new Error('Premium subscription is required to save taper plans.');
      }

      if (!db || !user) {
        throw new Error('User is not authenticated.');
      }

      const generatedPlan = generateTaperSchedule({
        currentDose: input.currentDose,
        targetDose: input.targetDose,
        timelineDays: input.timelineDays,
        strategy: input.strategy,
        startDate: input.startDate,
        stepIntervalDays: input.stepIntervalDays,
        percentageReductionPerStep: input.percentageReductionPerStep,
      });

      const taperPlanRef = doc(db, `taper-plans-${user.uid}`, TAPER_PLAN_DOC_ID).withConverter(
        taperPlanConverter
      );

      const nextPlan = mapGeneratedPlanToFirestoreModel(generatedPlan, plan, undefined);

      await setDoc(taperPlanRef, nextPlan);
      setError(null);

      return nextPlan;
    },
    [db, enabled, plan, user]
  );

  const regeneratePlanFromDeviation = useCallback(
    async (input: RegenerateTaperPlanInput): Promise<TaperPlan> => {
      if (!enabled) {
        throw new Error('Premium subscription is required to adjust taper plans.');
      }

      if (!db || !user) {
        throw new Error('User is not authenticated.');
      }

      if (!plan) {
        throw new Error('Create a taper plan before regenerating.');
      }

      const safeActualDose = Number.isFinite(input.actualDose) ? Math.max(0, input.actualDose) : Number.NaN;

      if (!Number.isFinite(safeActualDose) || safeActualDose <= 0) {
        throw new Error('Actual dose must be greater than 0 to regenerate plan.');
      }

      if (safeActualDose <= plan.targetDose) {
        throw new Error('Actual dose is already at or below your target dose.');
      }

      const asOfDate =
        input.asOfDate instanceof Date && !Number.isNaN(input.asOfDate.getTime())
          ? input.asOfDate
          : new Date();

      const elapsedDays = getElapsedDays(plan.startDateISO, asOfDate);
      const remainingDaysFromPlan = Math.max(2, plan.timelineDays - elapsedDays);
      const remainingDays =
        Number.isFinite(input.remainingDays) && (input.remainingDays as number) >= 2
          ? Math.floor(input.remainingDays as number)
          : remainingDaysFromPlan;

      const generatedPlan = generateTaperSchedule({
        currentDose: safeActualDose,
        targetDose: plan.targetDose,
        timelineDays: remainingDays,
        strategy: plan.strategy,
        startDate: asOfDate,
        stepIntervalDays: plan.strategyConfig.stepIntervalDays,
        percentageReductionPerStep: plan.strategyConfig.percentageReductionPerStep || undefined,
      });

      const regenerationEntry: TaperPlanRegeneration = {
        atISO: new Date().toISOString(),
        reason: input.reason?.trim() || 'deviation',
        actualDose: safeActualDose,
        remainingDays,
      };

      const taperPlanRef = doc(db, `taper-plans-${user.uid}`, TAPER_PLAN_DOC_ID).withConverter(
        taperPlanConverter
      );

      const nextPlan = mapGeneratedPlanToFirestoreModel(generatedPlan, plan, regenerationEntry);

      await setDoc(taperPlanRef, nextPlan);
      setError(null);

      return nextPlan;
    },
    [db, enabled, plan, user]
  );

  const getTargetForDate = useCallback(
    (date: Date): number | null => {
      if (!plan) {
        return null;
      }

      return getTargetDoseForDate(plan, date);
    },
    [plan]
  );

  const getDeviationForDate = useCallback(
    (date: Date, actualDose: number): DatedDoseDeviation | null => {
      if (!plan || !(date instanceof Date) || Number.isNaN(date.getTime())) {
        return null;
      }

      const targetDose = getTargetDoseForDate(plan, date);

      if (!Number.isFinite(targetDose)) {
        return null;
      }

      const comparison = compareActualDoseToTarget(actualDose, targetDose);

      return {
        ...comparison,
        dateISO: date.toISOString().split('T')[0],
      };
    },
    [plan]
  );

  const clearPlan = useCallback(async (): Promise<void> => {
    if (!enabled) {
      throw new Error('Premium subscription is required to manage taper plans.');
    }

    if (!db || !user) {
      return;
    }

    const taperPlanRef = doc(db, `taper-plans-${user.uid}`, TAPER_PLAN_DOC_ID);
    await deleteDoc(taperPlanRef);
    setError(null);
  }, [db, enabled, user]);

  return {
    plan,
    isLoading,
    error,
    adherenceEntries,
    savePlan,
    regeneratePlanFromDeviation,
    getTargetForDate,
    getDeviationForDate,
    clearPlan,
  };
};

export default useTaperPlan;
