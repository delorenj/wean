export type SyncStatus = 'syncing' | 'offline' | 'synced';

export interface ResolveSyncStatusInput {
  hasPendingWrites: boolean;
  fromCache: boolean;
  hasSeenServerSnapshot: boolean;
  isManualSyncing: boolean;
  isNavigatorOffline: boolean;
}

export const SYNC_STATUS_LABELS: Record<SyncStatus, string> = {
  syncing: 'Syncing...',
  offline: 'Offline',
  synced: 'Synced',
};

export const resolveSyncStatus = ({
  hasPendingWrites,
  fromCache,
  hasSeenServerSnapshot,
  isManualSyncing,
  isNavigatorOffline,
}: ResolveSyncStatusInput): SyncStatus => {
  if (isNavigatorOffline) {
    return 'offline';
  }

  if (isManualSyncing || hasPendingWrites) {
    return 'syncing';
  }

  if (fromCache && hasSeenServerSnapshot) {
    return 'offline';
  }

  if (fromCache) {
    return 'syncing';
  }

  return 'synced';
};

export const formatLastSyncTimestamp = (lastSyncAt: Date | null): string => {
  if (!lastSyncAt || Number.isNaN(lastSyncAt.getTime())) {
    return 'Never';
  }

  return lastSyncAt.toLocaleString();
};
