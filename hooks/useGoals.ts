import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Timestamp,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { Model, ModelConverter } from '../models/Model';
import { useFirebase } from '../context/firebaseConfig';
import useFireauth from './useFireauth';
import { useDoses } from './useDoses';
import {
  buildMilestoneStates,
  calculateProgressPercentage,
  getReachedMilestones,
  GoalMilestoneState,
  GoalMilestoneThreshold,
} from './useGoals.helpers';

const GOAL_DOC_ID = 'active-goal';

export interface Goal extends Model {
  id?: string;
  startDose: number;
  targetDose: number;
  targetDate: Timestamp;
  notes?: string;
  reachedMilestones?: GoalMilestoneThreshold[];
  lastCelebratedMilestone?: GoalMilestoneThreshold | null;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface SaveGoalInput {
  startDose: number;
  targetDose: number;
  targetDate: Date;
  notes?: string;
}

export interface UseGoalsResult {
  goal: Goal | null;
  isLoading: boolean;
  error: string | null;
  currentDose: number;
  progressPercentage: number;
  milestoneStates: GoalMilestoneState[];
  celebrationMilestone: GoalMilestoneThreshold | null;
  saveGoal: (input: SaveGoalInput) => Promise<void>;
  clearGoal: () => Promise<void>;
  dismissCelebration: () => void;
}

const normalizeMilestones = (milestones?: number[]): GoalMilestoneThreshold[] => {
  if (!Array.isArray(milestones)) {
    return [];
  }

  return milestones
    .filter((milestone): milestone is GoalMilestoneThreshold =>
      milestone === 25 || milestone === 50 || milestone === 75 || milestone === 100
    )
    .sort((left, right) => left - right);
};

const goalsConverter: ModelConverter = {
  toFirestore: (goal: Goal) => ({
    startDose: goal.startDose,
    targetDose: goal.targetDose,
    targetDate: goal.targetDate,
    notes: goal.notes || '',
    reachedMilestones: normalizeMilestones(goal.reachedMilestones),
    lastCelebratedMilestone: goal.lastCelebratedMilestone || null,
    createdAt: goal.createdAt,
    updatedAt: goal.updatedAt,
  }),
  fromFirestore: (snapshot: any, options: any): Goal => {
    const data = snapshot.data(options);

    return {
      id: snapshot.id,
      startDose: data.startDose,
      targetDose: data.targetDose,
      targetDate: data.targetDate,
      notes: data.notes || '',
      reachedMilestones: normalizeMilestones(data.reachedMilestones),
      lastCelebratedMilestone:
        data.lastCelebratedMilestone === 25 ||
        data.lastCelebratedMilestone === 50 ||
        data.lastCelebratedMilestone === 75 ||
        data.lastCelebratedMilestone === 100
          ? data.lastCelebratedMilestone
          : null,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  },
};

export const useGoals = (enabled = true): UseGoalsResult => {
  const { user } = useFireauth();
  const { db } = useFirebase();
  const { totalDoses } = useDoses();

  const [goal, setGoal] = useState<Goal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [celebrationMilestone, setCelebrationMilestone] = useState<GoalMilestoneThreshold | null>(null);

  useEffect(() => {
    if (!enabled) {
      setGoal(null);
      setIsLoading(false);
      return;
    }

    if (!db || !user) {
      setGoal(null);
      setIsLoading(false);
      return;
    }

    const goalRef = doc(db, `goals-${user.uid}`, GOAL_DOC_ID).withConverter(goalsConverter);

    const unsubscribe = onSnapshot(
      goalRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setGoal(null);
          setIsLoading(false);
          return;
        }

        setGoal(snapshot.data());
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

  const milestoneStates = useMemo(
    () => buildMilestoneStates(progressPercentage, goal?.reachedMilestones || []),
    [goal?.reachedMilestones, progressPercentage]
  );

  useEffect(() => {
    if (!enabled || !db || !user || !goal) {
      return;
    }

    const alreadyCelebrated = normalizeMilestones(goal.reachedMilestones);
    const reachedNow = getReachedMilestones(progressPercentage);
    const newlyReached = reachedNow.filter((milestone) => !alreadyCelebrated.includes(milestone));

    if (!newlyReached.length) {
      return;
    }

    const latestMilestone = newlyReached[newlyReached.length - 1];
    const nextCelebratedMilestones = normalizeMilestones([...alreadyCelebrated, ...newlyReached]);

    setCelebrationMilestone(latestMilestone);

    const goalRef = doc(db, `goals-${user.uid}`, GOAL_DOC_ID);

    void updateDoc(goalRef, {
      reachedMilestones: nextCelebratedMilestones,
      lastCelebratedMilestone: latestMilestone,
      updatedAt: Timestamp.now(),
    }).catch((updateError) => {
      console.log('Failed to update milestone celebration state', updateError);
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

      if (safeTargetDose >= safeStartDose) {
        throw new Error('Target dose must be lower than your current dose.');
      }

      if (!(input.targetDate instanceof Date) || Number.isNaN(input.targetDate.getTime())) {
        throw new Error('Target date is invalid.');
      }

      const now = Timestamp.now();
      const goalRef = doc(db, `goals-${user.uid}`, GOAL_DOC_ID).withConverter(goalsConverter);

      const nextGoal: Goal = {
        id: GOAL_DOC_ID,
        startDose: safeStartDose,
        targetDose: safeTargetDose,
        targetDate: Timestamp.fromDate(input.targetDate),
        notes: input.notes?.trim() || '',
        reachedMilestones: [],
        lastCelebratedMilestone: null,
        createdAt: goal?.createdAt || now,
        updatedAt: now,
      };

      await setDoc(goalRef, nextGoal);
      setError(null);
      setCelebrationMilestone(null);
    },
    [db, enabled, goal?.createdAt, user]
  );

  const clearGoal = useCallback(async () => {
    if (!enabled) {
      throw new Error('Premium subscription is required to manage goals.');
    }

    if (!db || !user) {
      return;
    }

    const goalRef = doc(db, `goals-${user.uid}`, GOAL_DOC_ID);
    await deleteDoc(goalRef);
    setCelebrationMilestone(null);
    setError(null);
  }, [db, enabled, user]);

  const dismissCelebration = useCallback(() => {
    setCelebrationMilestone(null);
  }, []);

  return {
    goal,
    isLoading,
    error,
    currentDose: totalDoses,
    progressPercentage,
    milestoneStates,
    celebrationMilestone,
    saveGoal,
    clearGoal,
    dismissCelebration,
  };
};

export default useGoals;
