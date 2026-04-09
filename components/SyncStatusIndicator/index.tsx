import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';
import useDesignTokens from '../../hooks/useDesignTokens';
import { SyncStatus, SYNC_STATUS_LABELS } from '../../hooks/useSyncStatus.helpers';

interface SyncStatusIndicatorProps {
  status: SyncStatus;
  lastSyncLabel: string;
  onSyncNow: () => Promise<void>;
}

const getStatusColor = (status: SyncStatus, colors: ReturnType<typeof useDesignTokens>['colors']) => {
  if (status === 'offline') {
    return colors.error;
  }

  if (status === 'synced') {
    return colors.success;
  }

  return colors.warning;
};

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  status,
  lastSyncLabel,
  onSyncNow,
}) => {
  const { colors, spacing, typography, borderRadius } = useDesignTokens();
  const statusColor = getStatusColor(status, colors);

  const styles = StyleSheet.create({
    container: {
      marginHorizontal: spacing[16],
      marginBottom: spacing[12],
      padding: spacing[16],
      borderWidth: 1,
      borderColor: colors.neutral[200],
      borderRadius: borderRadius.lg,
      backgroundColor: colors.surface,
      gap: spacing[12],
    },
    title: {
      fontSize: typography.titleMedium.fontSize,
      lineHeight: typography.titleMedium.lineHeight,
      fontWeight: '600',
      color: colors.onSurface,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[8],
    },
    statusDot: {
      width: spacing[8],
      height: spacing[8],
      borderRadius: borderRadius.full,
      backgroundColor: statusColor,
    },
    statusText: {
      fontSize: typography.bodyMedium.fontSize,
      lineHeight: typography.bodyMedium.lineHeight,
      fontWeight: '600',
      color: statusColor,
    },
    lastSyncText: {
      fontSize: typography.bodySmall.fontSize,
      lineHeight: typography.bodySmall.lineHeight,
      color: colors.onSurfaceVariant,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dose Sync</Text>

      <View style={styles.statusRow}>
        {status === 'syncing'
          ? <ActivityIndicator size="small" color={statusColor} />
          : <View style={styles.statusDot} />}
        <Text style={styles.statusText}>{SYNC_STATUS_LABELS[status]}</Text>
      </View>

      <Text style={styles.lastSyncText}>Last sync: {lastSyncLabel}</Text>

      <Button mode="outlined" onPress={() => { void onSyncNow(); }} disabled={status === 'syncing'}>
        Sync now
      </Button>
    </View>
  );
};

export default SyncStatusIndicator;
