import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  collection,
  doc,
  getDocFromServer,
  getDocsFromServer,
  limit,
  onSnapshot,
  onSnapshotsInSync,
  query,
} from 'firebase/firestore';
import useFireauth from './useFireauth';
import { useFirebase } from '../context/firebaseConfig';
import {
  formatLastSyncTimestamp,
  resolveSyncStatus,
  SyncStatus,
  SYNC_STATUS_LABELS,
} from './useSyncStatus.helpers';

interface SyncMetadata {
  hasPendingWrites: boolean;
  fromCache: boolean;
}

export interface SyncStatusState {
  status: SyncStatus;
  statusLabel: string;
  lastSyncAt: Date | null;
  lastSyncLabel: string;
  isSyncing: boolean;
  isOffline: boolean;
  syncNow: () => Promise<void>;
}

const getNavigatorOfflineState = (): boolean => {
  if (typeof navigator === 'undefined' || typeof navigator.onLine !== 'boolean') {
    return false;
  }

  return !navigator.onLine;
};

export const useSyncStatus = (): SyncStatusState => {
  const { db } = useFirebase();
  const { user } = useFireauth();

  const [status, setStatus] = useState<SyncStatus>('syncing');
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);

  const metadataRef = useRef<SyncMetadata>({ hasPendingWrites: false, fromCache: true });
  const hasSeenServerSnapshotRef = useRef(false);
  const isManualSyncingRef = useRef(false);
  const isNavigatorOfflineRef = useRef(getNavigatorOfflineState());

  const refreshSyncStatus = useCallback(() => {
    const nextStatus = resolveSyncStatus({
      hasPendingWrites: metadataRef.current.hasPendingWrites,
      fromCache: metadataRef.current.fromCache,
      hasSeenServerSnapshot: hasSeenServerSnapshotRef.current,
      isManualSyncing: isManualSyncingRef.current,
      isNavigatorOffline: isNavigatorOfflineRef.current,
    });

    setStatus(nextStatus);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') {
      return undefined;
    }

    const handleOffline = () => {
      isNavigatorOfflineRef.current = true;
      setStatus('offline');
    };

    const handleOnline = () => {
      isNavigatorOfflineRef.current = false;
      refreshSyncStatus();
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [refreshSyncStatus]);

  useEffect(() => {
    if (!db || !user) {
      setStatus('offline');
      return undefined;
    }

    metadataRef.current = { hasPendingWrites: false, fromCache: true };
    hasSeenServerSnapshotRef.current = false;
    isNavigatorOfflineRef.current = getNavigatorOfflineState();
    refreshSyncStatus();

    const syncProbeQuery = query(collection(db, `doses-${user.uid}`), limit(1));

    const unsubscribeSnapshot = onSnapshot(
      syncProbeQuery,
      { includeMetadataChanges: true },
      (snapshot) => {
        metadataRef.current = {
          hasPendingWrites: snapshot.metadata.hasPendingWrites,
          fromCache: snapshot.metadata.fromCache,
        };

        if (!snapshot.metadata.fromCache) {
          hasSeenServerSnapshotRef.current = true;

          if (!snapshot.metadata.hasPendingWrites) {
            setLastSyncAt(new Date());
          }
        }

        refreshSyncStatus();
      },
      (error) => {
        console.error('Failed to monitor sync status:', error);
        setStatus('offline');
      }
    );

    const unsubscribeInSync = onSnapshotsInSync(db, () => {
      if (!metadataRef.current.fromCache && !metadataRef.current.hasPendingWrites) {
        setLastSyncAt((previousLastSync) => previousLastSync ?? new Date());
      }

      refreshSyncStatus();
    });

    return () => {
      unsubscribeSnapshot();
      unsubscribeInSync();
    };
  }, [db, refreshSyncStatus, user]);

  const syncNow = useCallback(async (): Promise<void> => {
    if (!db || !user) {
      return;
    }

    isManualSyncingRef.current = true;
    refreshSyncStatus();

    try {
      const doseQuery = query(collection(db, `doses-${user.uid}`), limit(1));
      await getDocsFromServer(doseQuery);
      await getDocFromServer(doc(db, 'settings', user.uid));

      hasSeenServerSnapshotRef.current = true;
      metadataRef.current = { hasPendingWrites: false, fromCache: false };
      setLastSyncAt(new Date());
    } catch (error) {
      console.error('Manual sync failed:', error);
      setStatus('offline');
    } finally {
      isManualSyncingRef.current = false;
      refreshSyncStatus();
    }
  }, [db, refreshSyncStatus, user]);

  return useMemo(
    () => ({
      status,
      statusLabel: SYNC_STATUS_LABELS[status],
      lastSyncAt,
      lastSyncLabel: formatLastSyncTimestamp(lastSyncAt),
      isSyncing: status === 'syncing',
      isOffline: status === 'offline',
      syncNow,
    }),
    [lastSyncAt, status, syncNow]
  );
};

export default useSyncStatus;
