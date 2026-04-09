import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Timestamp,
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { Model, ModelConverter } from '../models/Model';
import { useFirebase } from '../context/firebaseConfig';
import useFireauth from './useFireauth';
import { useDoses } from './useDoses';
import {
  buildMilestoneStates,
  calculateProgressPercentage,
  GoalDateMilestone,
  GoalMilestoneState,
  GoalMilestoneThreshold,
  GOAL_MILESTONE_THRESHOLDS,
  generateWeeklyMilestones,
  reconcileMilestoneAchievements,
} from './useGoals.helpers';

export type GoalStatus = 'active' | 'completed' | 'abandoned';

export interface GoalMilestone extends GoalDateMilestone {}

export interface Goal extends Model {
  id?: string;
  startDose: number;
  targetDose: number;
  targetDate: Timestamp;
  notes?: string;
  milestones: GoalMilestone[];
  status: GoalStatus;
  reachedMilestones?: GoalMilestoneThreshold[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  completedAt?: Timestamp | null;
  abandonedAt?: Timestamp | null;
}

export interface SaveGoalInput {
  startDose: number;
  targetDose: number;
  targetDate: Date;
  notes?: string;
}

export interface UseGoalsResult {
  goal: Goal | null;
  goalHistory: Goal[];
  isLoading: boolean;
  error: string | null;
  currentDose: number;
  progressPercentage: number;
  milestoneStates: GoalMilestoneState[];
  celebrationMilestone: GoalMilestone | null;
  saveGoal: (input: SaveGoalInput) => Promise<void>;
  clearGoal: () => Promise<void>;
  abandonGoal: () => Promise<void>;
  completeGoal: () => Promise<void>;
  dismissCelebration: () => void;
}

const normalizeMilestoneThresholds = (milestones?: number[]): GoalMilestoneThreshold[] => {
  if (!Array.isArray(milestones)) {
    return [];
  }

  return milestones
    .filter((milestone): milestone is GoalMilestoneThreshold =>
      GOAL_MILESTONE_THRESHOLDS.includes(milestone as GoalMilestoneThreshold)
    )
    .sort((left, right) => left - right);
};

const normalizeStatus = (status: unknown): GoalStatus => {
  if (status === 'active' || status === 'completed' || status === 'abandoned') {
    return status;
  }

  return 'active';
};

const normalizeTimestamp = (value: unknown): Timestamp | null => {
  if (!value) {
    return null;
  }

  if (value instanceof Timestamp) {
    return value;
  }

  if (typeof (value as any)?.toDate === 'function') {
    return value as Timestamp;
  }

  return null;
};

const normalizeMilestones = (
  milestones: unknown,
  fallbackInput?: { startDose: number; targetDose: number; createdAt: Timestamp | null; targetDate: Timestamp | null }
): GoalMilestone[] => {
  if (Array.isArray(milestones) && milestones.length) {
    return milestones
      .map((milestone, index) => {
        const targetDateISO =
          typeof milestone?.targetDateISO === 'string' && milestone.targetDateISO
            ? milestone.targetDateISO
            : '';

        if (!targetDateISO) {
          return null;
        }

        const id = typeof milestone?.id === 'string' && milestone.id ? milestone.id : `milestone-${index + 1}`;
        const label = typeof milestone?.label === 'string' && milestone.label ? milestone.label : `Week ${index + 1}`;
        const targetDose = Number.isFinite(milestone?.targetDose) ? Math.max(0, milestone.targetDose) : 0;

        return {
          id,
          label,
          targetDose,
          targetDateISO,
          achieved: Boolean(milestone?.achieved),
          achievedAtISO:
            typeof milestone?.achievedAtISO === 'string' && milestone.achievedAtISO
              ? milestone.achievedAtISO
              : null,
          actualDose: Number.isFinite(milestone?.actualDose) ? Math.max(0, milestone.actualDose) : null,
        } as GoalMilestone;
      })
      .filter(Boolean) as GoalMilestone[];
  }

  if (!fallbackInput?.targetDate) {
    return [];
  }

  const startDate = fallbackInput.createdAt?.toDate?.() || new Date();
  const targetDate = fallbackInput.targetDate.toDate();

  return generateWeeklyMilestones({
    startDose: fallbackInput.startDose,
    targetDose: fallbackInput.targetDose,
    startDate,
    targetDate,
  });
};

const goalsConverter: ModelConverter = {
  toFirestore: (goal: Goal) => ({
    startDose: goal.startDose,
    targetDose: goal.targetDose,
    targetDate: goal.targetDate,
    notes: goal.notes || '',
    status: normalizeStatus(goal.status),
    milestones: normalizeMilestones(goal.milestones),
    reachedMilestones: normalizeMilestoneThresholds(goal.reachedMilestones),
    completedAt: goal.completedAt || null,
    abandonedAt: goal.abandonedAt || null,
    createdAt: goal.createdAt,
    updatedAt: goal.updatedAt,
  }),
  fromFirestore: (snapshot: any, options: any): Goal => {
    const data = snapshot.data(options);

    const startDose = Number.isFinite(data?.startDose) ? Math.max(0, data.startDose) : 0;
    const targetDose = Number.isFinite(data?.targetDose) ? Math.max(0, data.targetDose) : 0;
    const targetDate = normalizeTimestamp(data?.targetDate) || Timestamp.now();
    const createdAt = normalizeTimestamp(data?.createdAt);

    return {
      id: snapshot.id,
      startDose,
      targetDose,
      targetDate,
      notes: typeof data?.notes === 'string' ? data.notes : '',
      status: normalizeStatus(data?.status),
      milestones: normalizeMilestones(data?.milestones, {
        startDose,
        targetDose,
        targetDate,
        createdAt,
      }),
      reachedMilestones: normalizeMilestoneThresholds(data?.reachedMilestones),
      completedAt: normalizeTimestamp(data?.completedAt),
      abandonedAt: normalizeTimestamp(data?.abandonedAt),
      createdAt: createdAt || undefined,
      updatedAt: normalizeTimestamp(data?.updatedAt) || undefined,
    };
  },
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

const toMillis = (timestamp?: Timestamp | null): number => {
  if (!timestamp) {
    return 0;
  }

  if (typeof timestamp.toMillis === 'function') {
    return timestamp.toMillis();
  }

  return 0;
};

const sortGoalsByRecency = (left: Goal, right: Goal): number => {
  const leftTime = toMillis(left.updatedAt || left.createdAt || null);
  const rightTime = toMillis(right.updatedAt || right.createdAt || null);

  return rightTime - leftTime;
};

const milestonesForComparison = (milestones: GoalMilestone[]): string =>
  JSON.stringify(
    milestones.map((milestone) => ({
      id: milestone.id,
      achieved: milestone.achieved,
      achievedAtISO: milestone.achievedAtISO || null,
      actualDose: milestone.actualDose ?? null,
    }))
  );

export const useGoals = (enabled = true): UseGoalsResult => {
  const { user } = useFireauth();
  const { db } = useFirebase();
  const { totalDoses, doseHistory } = useDoses();

  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [celebrationMilestone, setCelebrationMilestone] = useState<GoalMilestone | null>(null);
  const autoCompletingGoalRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setGoals([]);
      setIsLoading(false);
      return;
    }

    if (!db || !user) {
      setGoals([]);
      setIsLoading(false);
      return;
    }

    const goalsRef = collection(db, `goals-${user.uid}`).withConverter(goalsConverter);

    const unsubscribe = onSnapshot(
      goalsRef,
      (snapshot) => {
        const nextGoals: Goal[] = [];

        snapshot.forEach((snapshotDoc) => {
          nextGoals.push(snapshotDoc.data());
        });

        setGoals(nextGoals.sort(sortGoalsByRecency));
        setIsLoading(false);
      },
      (snapshotError) => {
        setError(snapshotError instanceof Error ? snapshotError.message : 'Failed to load goals');
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [db, enabled, user]);

  const goal = useMemo(() => goals.find((entry) => entry.status === 'active') || null, [goals]);

  const goalHistory = useMemo(
    () => goals.filter((entry) => entry.status === 'completed' || entry.status === 'abandoned'),
    [goals]
  );

  const doseTotalsByDate = useMemo(() => {
    const mapped: Record<string, number> = {};

    doseHistory.forEach((dose) => {
      const dateISO = toDateISOFromTimestamp(dose.date?.seconds, dose.date?.nanoseconds);

      if (!dateISO) {
        return;
      }

      const runningDose = mapped[dateISO] || 0;
      mapped[dateISO] = runningDose + (Number.isFinite(dose.amount) ? Math.max(0, dose.amount) : 0);
    });

    return mapped;
  }, [doseHistory]);

  const progressPercentage = useMemo(() => {
    if (!goal) {
      return 0;
    }

    return calculateProgressPercentage({
      startDose: goal.startDose,
      targetDose: goal.targetDose,
      currentDose: totalDoses,
    });
  }, [goal, totalDoses]);

  const milestoneStates = useMemo(() => {
    if (!goal) {
      return buildMilestoneStates(0, []);
    }

    const celebratedMilestones = goal.reachedMilestones || [];

    return buildMilestoneStates(progressPercentage, celebratedMilestones);
  }, [goal, progressPercentage]);

  useEffect(() => {
    if (!enabled || !db || !user || !goal?.id || goal.status !== 'active') {
      return;
    }

    const reconciliation = reconcileMilestoneAchievements({
      milestones: goal.milestones,
      doseTotalsByDate,
    });

    const hasMilestoneChanges =
      milestonesForComparison(reconciliation.milestones) !== milestonesForComparison(goal.milestones);

    if (!hasMilestoneChanges) {
      return;
    }

    const goalRef = doc(db, `goals-${user.uid}`, goal.id);

    void updateDoc(goalRef, {
      milestones: reconciliation.milestones,
      updatedAt: Timestamp.now(),
    }).catch((updateError) => {
      console.log('Failed to sync goal milestone achievements', updateError);
    });

    if (reconciliation.newlyAchievedMilestones.length) {
      setCelebrationMilestone(
        reconciliation.newlyAchievedMilestones[reconciliation.newlyAchievedMilestones.length - 1]
      );
    }
  }, [db, doseTotalsByDate, enabled, goal, user]);

  useEffect(() => {
    if (!enabled || !db || !user || !goal?.id || goal.status !== 'active') {
      autoCompletingGoalRef.current = null;
      return;
    }

    if (progressPercentage < 100) {
      autoCompletingGoalRef.current = null;
      return;
    }

    if (autoCompletingGoalRef.current === goal.id) {
      return;
    }

    autoCompletingGoalRef.current = goal.id;

    const goalRef = doc(db, `goals-${user.uid}`, goal.id);
    const now = Timestamp.now();

    void updateDoc(goalRef, {
      status: 'completed',
      completedAt: now,
      updatedAt: now,
    }).catch((updateError) => {
      autoCompletingGoalRef.current = null;
      console.log('Failed to auto-complete goal', updateError);
    });
  }, [db, enabled, goal, progressPercentage, user]);

  const saveGoal = useCallback(
    async (input: SaveGoalInput) => {
      if (!enabled) {
        throw new Error('Premium subscription is required to save goals.');
      }

      if (!db || !user) {
        throw new Error('User is not authenticated.');
      }

      const safeStartDose = Number.isFinite(input.startDose) ? Math.max(0, input.startDose) : 0;
      const safeTargetDose = Number.isFinite(input.targetDose) ? Math.max(0, input.targetDose) : 0;

      if (safeStartDose <= 0) {
        throw new Error('Current dose must be greater than 0.');
      }

      if (safeTargetDose >= safeStartDose) {
        throw new Error('Target dose must be lower than your current dose.');
      }

      if (!(input.targetDate instanceof Date) || Number.isNaN(input.targetDate.getTime())) {
        throw new Error('Target date is invalid.');
      }

      if (input.targetDate.getTime() <= Date.now()) {
        throw new Error('Target date must be in the future.');
      }

      const now = Timestamp.now();
      const startDate = new Date();
      const milestones = generateWeeklyMilestones({
        startDose: safeStartDose,
        targetDose: safeTargetDose,
        startDate,
        targetDate: input.targetDate,
      });

      const goalsCollectionRef = collection(db, `goals-${user.uid}`).withConverter(goalsConverter);
      const activeGoalRef = goal?.id
        ? doc(db, `goals-${user.uid}`, goal.id).withConverter(goalsConverter)
        : doc(goalsCollectionRef);

      const nextGoal: Goal = {
        id: activeGoalRef.id,
        startDose: safeStartDose,
        targetDose: safeTargetDose,
        targetDate: Timestamp.fromDate(input.targetDate),
        notes: input.notes?.trim() || '',
        status: 'active',
        milestones,
        reachedMilestones: [],
        createdAt: goal?.createdAt || now,
        updatedAt: now,
        completedAt: null,
        abandonedAt: null,
      };

      const batch = writeBatch(db);

      goals
        .filter((entry) => entry.status === 'active' && entry.id && entry.id !== activeGoalRef.id)
        .forEach((entry) => {
          batch.update(doc(db, `goals-${user.uid}`, entry.id as string), {
            status: 'abandoned',
            abandonedAt: now,
            updatedAt: now,
          });
        });

      batch.set(activeGoalRef, nextGoal);
      await batch.commit();

      setError(null);
      setCelebrationMilestone(null);
    },
    [db, enabled, goal, goals, user]
  );

  const abandonGoal = useCallback(async () => {
    if (!enabled) {
      throw new Error('Premium subscription is required to manage goals.');
    }

    if (!db || !user || !goal?.id) {
      return;
    }

    const goalRef = doc(db, `goals-${user.uid}`, goal.id);
    const now = Timestamp.now();

    await updateDoc(goalRef, {
      status: 'abandoned',
      abandonedAt: now,
      updatedAt: now,
    });

    setCelebrationMilestone(null);
    setError(null);
  }, [db, enabled, goal?.id, user]);

  const completeGoal = useCallback(async () => {
    if (!enabled) {
      throw new Error('Premium subscription is required to manage goals.');
    }

    if (!db || !user || !goal?.id) {
      return;
    }

    const goalRef = doc(db, `goals-${user.uid}`, goal.id);
    const now = Timestamp.now();

    await updateDoc(goalRef, {
      status: 'completed',
      completedAt: now,
      updatedAt: now,
    });

    setError(null);
  }, [db, enabled, goal?.id, user]);

  const clearGoal = useCallback(async () => {
    await abandonGoal();
  }, [abandonGoal]);

  const dismissCelebration = useCallback(() => {
    setCelebrationMilestone(null);
  }, []);

  return {
    goal,
    goalHistory,
    isLoading,
    error,
    currentDose: totalDoses,
    progressPercentage,
    milestoneStates,
    celebrationMilestone,
    saveGoal,
    clearGoal,
    abandonGoal,
    completeGoal,
    dismissCelebration,
  };
};

export default useGoals;
