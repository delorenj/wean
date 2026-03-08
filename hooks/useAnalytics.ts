import { useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { Timestamp, collection, onSnapshot, query, where } from 'firebase/firestore';
import { useFirebase } from '../context/firebaseConfig';
import useFireauth from './useFireauth';
import { useRevenueCat } from './useRevenueCat';
import {
  DoseHistoryLike,
  TrendAnalyticsSnapshot,
  addUTCDays,
  buildTrendAnalyticsSnapshot,
  getUTCStartOfDay,
} from './useAnalytics.helpers';

export interface UseAnalyticsResult {
  analytics: TrendAnalyticsSnapshot;
  isLoading: boolean;
  error: string | null;
  isPremiumUnlocked: boolean;
  isPremiumLoading: boolean;
}

const EMPTY_ANALYTICS: TrendAnalyticsSnapshot = {
  weekly: {
    dailyTotals: [],
    averageDailyDose: 0,
    trend: {
      direction: 'stable',
      delta: 0,
      deltaPercent: 0,
    },
    reductionStreakDays: 0,
  },
  monthly: {
    dailyTotals: [],
    averageDailyDose: 0,
    trend: {
      direction: 'stable',
      delta: 0,
      deltaPercent: 0,
    },
    reductionStreakDays: 0,
  },
};

const sortDoseHistory = (left: DoseHistoryLike, right: DoseHistoryLike): number => {
  const leftDate = left.date;
  const rightDate = right.date;

  const leftMs = leftDate instanceof Date
    ? leftDate.getTime()
    : typeof leftDate?.toDate === 'function'
      ? leftDate.toDate().getTime()
      : typeof leftDate?.seconds === 'number'
        ? leftDate.seconds * 1000
        : 0;

  const rightMs = rightDate instanceof Date
    ? rightDate.getTime()
    : typeof rightDate?.toDate === 'function'
      ? rightDate.toDate().getTime()
      : typeof rightDate?.seconds === 'number'
        ? rightDate.seconds * 1000
        : 0;

  return leftMs - rightMs;
};

const usePremiumAccess = () => {
  try {
    const { isProUser, isLoading } = useRevenueCat();

    return {
      isPremiumUnlocked: Platform.OS === 'web' || isProUser,
      isPremiumLoading: isLoading,
    };
  } catch {
    return {
      isPremiumUnlocked: true,
      isPremiumLoading: false,
    };
  }
};

export const useAnalytics = (unit = 'g'): UseAnalyticsResult => {
  const { db } = useFirebase();
  const { user } = useFireauth();
  const premiumAccess = usePremiumAccess();

  const [doseHistory, setDoseHistory] = useState<DoseHistoryLike[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (premiumAccess.isPremiumLoading) {
      setIsLoading(true);
      return;
    }

    if (!premiumAccess.isPremiumUnlocked) {
      setDoseHistory([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    if (!db || !user) {
      setDoseHistory([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const dosesRef = collection(db, `doses-${user.uid}`);
    const historyStartDate = addUTCDays(getUTCStartOfDay(new Date()), -29);
    const historyStart = Timestamp.fromDate(historyStartDate);
    const historyQuery = query(dosesRef, where('date', '>=', historyStart));

    const unsubscribe = onSnapshot(
      historyQuery,
      (snapshot) => {
        const historyData: DoseHistoryLike[] = [];

        snapshot.forEach((snapshotDoc) => {
          const data = snapshotDoc.data() as Partial<{
            amount: number;
            doseUnit: string;
            date: Timestamp;
          }>;

          if (typeof data.amount !== 'number' || typeof data.doseUnit !== 'string' || !data.date) {
            return;
          }

          historyData.push({
            amount: data.amount,
            doseUnit: data.doseUnit,
            date: data.date,
          });
        });

        setDoseHistory(historyData.sort(sortDoseHistory));
        setIsLoading(false);
      },
      (snapshotError) => {
        setError(snapshotError instanceof Error ? snapshotError.message : 'Failed to load analytics');
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [db, premiumAccess.isPremiumLoading, premiumAccess.isPremiumUnlocked, user]);

  const analytics = useMemo(() => {
    if (!premiumAccess.isPremiumUnlocked) {
      return EMPTY_ANALYTICS;
    }

    return buildTrendAnalyticsSnapshot(doseHistory, {
      endDate: new Date(),
      unit,
    });
  }, [doseHistory, premiumAccess.isPremiumUnlocked, unit]);

  return {
    analytics,
    isLoading,
    error,
    isPremiumUnlocked: premiumAccess.isPremiumUnlocked,
    isPremiumLoading: premiumAccess.isPremiumLoading,
  };
};

export default useAnalytics;
