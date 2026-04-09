import {
  formatLastSyncTimestamp,
  resolveSyncStatus,
} from './useSyncStatus.helpers';

describe('useSyncStatus.helpers', () => {
  it('returns syncing while manual sync is in progress', () => {
    const status = resolveSyncStatus({
      hasPendingWrites: false,
      fromCache: false,
      hasSeenServerSnapshot: true,
      isManualSyncing: true,
      isNavigatorOffline: false,
    });

    expect(status).toBe('syncing');
  });

  it('returns syncing when pending writes exist', () => {
    const status = resolveSyncStatus({
      hasPendingWrites: true,
      fromCache: true,
      hasSeenServerSnapshot: true,
      isManualSyncing: false,
      isNavigatorOffline: false,
    });

    expect(status).toBe('syncing');
  });

  it('returns offline when navigator reports offline', () => {
    const status = resolveSyncStatus({
      hasPendingWrites: false,
      fromCache: false,
      hasSeenServerSnapshot: true,
      isManualSyncing: false,
      isNavigatorOffline: true,
    });

    expect(status).toBe('offline');
  });

  it('returns offline when reading from cache after a server snapshot', () => {
    const status = resolveSyncStatus({
      hasPendingWrites: false,
      fromCache: true,
      hasSeenServerSnapshot: true,
      isManualSyncing: false,
      isNavigatorOffline: false,
    });

    expect(status).toBe('offline');
  });

  it('returns syncing for initial cache hydration before first server snapshot', () => {
    const status = resolveSyncStatus({
      hasPendingWrites: false,
      fromCache: true,
      hasSeenServerSnapshot: false,
      isManualSyncing: false,
      isNavigatorOffline: false,
    });

    expect(status).toBe('syncing');
  });

  it('returns synced when connected and no pending writes', () => {
    const status = resolveSyncStatus({
      hasPendingWrites: false,
      fromCache: false,
      hasSeenServerSnapshot: true,
      isManualSyncing: false,
      isNavigatorOffline: false,
    });

    expect(status).toBe('synced');
  });

  it('formats last sync timestamps and guards invalid dates', () => {
    const date = new Date('2026-03-07T23:00:00.000Z');
    const localeSpy = jest.spyOn(date, 'toLocaleString').mockReturnValue('Mar 7, 2026, 11:00 PM');

    expect(formatLastSyncTimestamp(date)).toBe('Mar 7, 2026, 11:00 PM');
    expect(formatLastSyncTimestamp(new Date('invalid'))).toBe('Never');
    expect(formatLastSyncTimestamp(null)).toBe('Never');

    localeSpy.mockRestore();
  });
});
