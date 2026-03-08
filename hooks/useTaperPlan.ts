import { useCallback, useEffect, useState } from 'react';
import {
  Timestamp,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';
import { Model, ModelConverter } from '../models/Model';
import { useFirebase } from '../context/firebaseConfig';
import useFireauth from './useFireauth';
import {
  generateTaperSchedule,
  GeneratedTaperSchedule,
  TaperMilestone,
  TaperScheduleStep,
  TaperSpeed,
} from './useTaperPlan.helpers';

const TAPER_PLAN_DOC_ID = 'active-plan';

export interface TaperPlan extends Model {
  id?: string;
  currentDose: number;
  targetDose: number;
  taperSpeed: TaperSpeed;
  reductionPercent: number;
  reductionEveryDays: number;
  startDateISO: string;
  estimatedCompletionDateISO: string;
  totalDays: number;
  schedule: TaperScheduleStep[];
  milestonesReached: TaperMilestone[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface SaveTaperPlanInput {
  currentDose: number;
  targetDose?: number;
  taperSpeed: TaperSpeed;
  startDate?: Date;
}

export interface UseTaperPlanResult {
  plan: TaperPlan | null;
  isLoading: boolean;
  error: string | null;
  savePlan: (input: SaveTaperPlanInput) => Promise<TaperPlan>;
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

const normalizeSchedule = (schedule?: TaperScheduleStep[]): TaperScheduleStep[] => {
  if (!Array.isArray(schedule)) {
    return [];
  }

  return schedule.map((step, index) => ({
    step: Number.isFinite(step?.step) ? step.step : index + 1,
    day: Number.isFinite(step?.day) ? step.day : index,
    dateISO: typeof step?.dateISO === 'string' ? step.dateISO : '',
    dose: Number.isFinite(step?.dose) ? step.dose : 0,
    milestones: normalizeMilestones(step?.milestones),
  }));
};

const taperPlanConverter: ModelConverter = {
  toFirestore: (plan: TaperPlan) => ({
    currentDose: plan.currentDose,
    targetDose: plan.targetDose,
    taperSpeed: plan.taperSpeed,
    reductionPercent: plan.reductionPercent,
    reductionEveryDays: plan.reductionEveryDays,
    startDateISO: plan.startDateISO,
    estimatedCompletionDateISO: plan.estimatedCompletionDateISO,
    totalDays: plan.totalDays,
    schedule: normalizeSchedule(plan.schedule),
    milestonesReached: normalizeMilestones(plan.milestonesReached),
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
  }),
  fromFirestore: (snapshot: any, options: any): TaperPlan => {
    const data = snapshot.data(options);

    return {
      id: snapshot.id,
      currentDose: data.currentDose,
      targetDose: data.targetDose,
      taperSpeed: data.taperSpeed,
      reductionPercent: data.reductionPercent,
      reductionEveryDays: data.reductionEveryDays,
      startDateISO: data.startDateISO,
      estimatedCompletionDateISO: data.estimatedCompletionDateISO,
      totalDays: data.totalDays,
      schedule: normalizeSchedule(data.schedule),
      milestonesReached: normalizeMilestones(data.milestonesReached),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  },
};

const mapGeneratedPlanToFirestoreModel = (
  generatedPlan: GeneratedTaperSchedule,
  existingPlanCreatedAt?: Timestamp
): TaperPlan => {
  const now = Timestamp.now();

  return {
    id: TAPER_PLAN_DOC_ID,
    currentDose: generatedPlan.startDose,
    targetDose: generatedPlan.targetDose,
    taperSpeed: generatedPlan.taperSpeed,
    reductionPercent: generatedPlan.reductionPercent,
    reductionEveryDays: generatedPlan.reductionEveryDays,
    startDateISO: generatedPlan.startDateISO,
    estimatedCompletionDateISO: generatedPlan.estimatedCompletionDateISO,
    totalDays: generatedPlan.totalDays,
    schedule: generatedPlan.schedule,
    milestonesReached: generatedPlan.milestonesReached,
    createdAt: existingPlanCreatedAt || now,
    updatedAt: now,
  };
};

export const useTaperPlan = (enabled = true): UseTaperPlanResult => {
  const { user } = useFireauth();
  const { db } = useFirebase();

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
        taperSpeed: input.taperSpeed,
        startDate: input.startDate,
      });

      const taperPlanRef = doc(db, `taper-plans-${user.uid}`, TAPER_PLAN_DOC_ID).withConverter(
        taperPlanConverter
      );

      const nextPlan = mapGeneratedPlanToFirestoreModel(generatedPlan, plan?.createdAt);

      await setDoc(taperPlanRef, nextPlan);
      setError(null);

      return nextPlan;
    },
    [db, enabled, plan?.createdAt, user]
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
    savePlan,
    clearPlan,
  };
};

export default useTaperPlan;
