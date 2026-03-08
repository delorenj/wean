import React, { useMemo } from 'react';
import {
  FlatList,
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { DailyDoseGauge } from '../DailyDoseGauge';
import { Index as RollingCalendarWeek, RollingCalendarWeekEntry } from '../../components/RollingCalendarWeek';
import { useDoses } from '../../hooks/useDoses';
import { useTaperSettings } from '../../hooks/useTaperSettings';
import useDesignTokens from '../../hooks/useDesignTokens';
import {
  buildDailyDoseTimelineEntries,
  DailyDoseTimelineEntry,
  formatTimelineDoseAmount,
} from './helpers';

export interface DailyDoseTimelineProps {
  onAddDosePress?: () => void;
  addDoseLabel?: string;
  testID?: string;
}

interface TimelineEntryItemProps {
  entry: DailyDoseTimelineEntry;
  isFirst: boolean;
  isLast: boolean;
  onPress: () => void;
}

interface TimelineListHeaderProps {
  currentDose: number;
  targetDose: number;
  unit: string;
  calendarEntries: RollingCalendarWeekEntry[];
  onAddDosePress: () => void;
  addDoseLabel: string;
}

const toTextStyle = (
  typographyStyle: (typeof import('../../src/tokens').Typography)[keyof (typeof import('../../src/tokens').Typography)]
): TextStyle => typographyStyle as TextStyle;

const TimelineEntryItem: React.FC<TimelineEntryItemProps> = ({ entry, isFirst, isLast, onPress }) => {
  const tokens = useDesignTokens();

  return (
    <View
      style={[
        styles.timelineEntryRow,
        {
          paddingHorizontal: tokens.spacing[16],
        },
      ]}
    >
      <View
        style={[
          styles.timelineRail,
          {
            width: tokens.spacing[24],
            marginRight: tokens.spacing[12],
          },
        ]}
      >
        <View
          style={{
            flex: 1,
            minHeight: tokens.spacing[12],
            width: tokens.spacing[2],
            backgroundColor: tokens.colors.primary[200],
            opacity: isFirst ? 0 : 1,
          }}
        />

        <View
          style={{
            width: tokens.spacing[12],
            height: tokens.spacing[12],
            borderRadius: tokens.borderRadius.full,
            backgroundColor: tokens.colors.primary[400],
            borderWidth: tokens.spacing[2],
            borderColor: tokens.colors.surface,
          }}
        />

        <View
          style={{
            flex: 1,
            minHeight: tokens.spacing[12],
            width: tokens.spacing[2],
            backgroundColor: tokens.colors.primary[200],
            opacity: isLast ? 0 : 1,
          }}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Edit ${entry.substance || 'dose'} logged at ${entry.timeLabel}`}
        onPress={onPress}
        style={[
          styles.entryCard,
          {
            padding: tokens.spacing[12],
            borderRadius: tokens.borderRadius.lg,
            backgroundColor: tokens.componentStates.card.default.backgroundColor,
            borderColor: tokens.componentStates.card.default.borderColor,
            borderWidth: tokens.spacing[2],
            gap: tokens.spacing[8],
            ...tokens.shadows.z1,
          },
        ]}
      >
        <View style={styles.entryMetaRow}>
          <Text
            style={{
              color: tokens.colors.onSurfaceVariant,
              ...toTextStyle(tokens.typography.labelLarge),
            }}
          >
            {entry.timeLabel}
          </Text>

          {entry.isEdited ? (
            <Text
              style={{
                color: tokens.colors.primary[600],
                ...toTextStyle(tokens.typography.labelMedium),
              }}
            >
              Edited
            </Text>
          ) : null}
        </View>

        <View style={[styles.amountRow, { gap: tokens.spacing[6] }]}> 
          <Text
            style={{
              color: tokens.colors.onSurface,
              ...toTextStyle(tokens.typography.titleLarge),
            }}
          >
            {formatTimelineDoseAmount(entry.amount)}
          </Text>
          <Text
            style={{
              color: tokens.colors.onSurfaceVariant,
              ...toTextStyle(tokens.typography.titleMedium),
            }}
          >
            {entry.unit}
          </Text>
        </View>

        {entry.substance ? (
          <Text
            style={{
              color: tokens.colors.onSurfaceVariant,
              ...toTextStyle(tokens.typography.bodySmall),
            }}
          >
            {entry.substance}
          </Text>
        ) : null}
      </Pressable>
    </View>
  );
};

const TimelineListHeader: React.FC<TimelineListHeaderProps> = ({
  currentDose,
  targetDose,
  unit,
  calendarEntries,
  onAddDosePress,
  addDoseLabel,
}) => {
  const tokens = useDesignTokens();

  return (
    <View style={{ paddingTop: tokens.spacing[8], gap: tokens.spacing[16] }}>
      <RollingCalendarWeek entries={calendarEntries} defaultTargetDose={targetDose} unit={unit} />

      <View style={{ paddingHorizontal: tokens.spacing[16] }}>
        <DailyDoseGauge currentDose={currentDose} targetDose={targetDose} unit={unit} />
      </View>

      <View
        style={{
          paddingHorizontal: tokens.spacing[16],
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: tokens.spacing[12],
        }}
      >
        <Text
          style={{
            color: tokens.colors.onSurface,
            ...toTextStyle(tokens.typography.titleMedium),
          }}
        >
          Today&apos;s Dose Timeline
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={addDoseLabel}
          onPress={onAddDosePress}
          style={{
            minHeight: tokens.spacing[40],
            borderRadius: tokens.borderRadius.full,
            paddingHorizontal: tokens.spacing[12],
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: tokens.spacing[2],
            borderColor: tokens.componentStates.card.active.borderColor,
            backgroundColor: tokens.componentStates.card.active.backgroundColor,
          }}
        >
          <Text
            style={{
              color: tokens.colors.primary[700],
              ...toTextStyle(tokens.typography.labelLarge),
            }}
          >
            {addDoseLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

interface TimelineEmptyStateProps {
  onAddDosePress: () => void;
  addDoseLabel: string;
}

const TimelineEmptyState: React.FC<TimelineEmptyStateProps> = ({ onAddDosePress, addDoseLabel }) => {
  const tokens = useDesignTokens();

  return (
    <View
      style={{
        marginHorizontal: tokens.spacing[16],
        marginTop: tokens.spacing[8],
        padding: tokens.spacing[16],
        borderRadius: tokens.borderRadius.lg,
        borderWidth: tokens.spacing[2],
        borderColor: tokens.colors.neutral[200],
        backgroundColor: tokens.colors.surfaceVariant,
        alignItems: 'center',
        gap: tokens.spacing[12],
      }}
    >
      <Text
        style={{
          color: tokens.colors.onSurface,
          textAlign: 'center',
          ...toTextStyle(tokens.typography.titleMedium),
        }}
      >
        No doses logged today.
      </Text>

      <Text
        style={{
          color: tokens.colors.onSurfaceVariant,
          textAlign: 'center',
          ...toTextStyle(tokens.typography.bodyMedium),
        }}
      >
        Start your day&apos;s timeline by logging your first dose.
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={addDoseLabel}
        onPress={onAddDosePress}
        style={{
          minHeight: tokens.spacing[48],
          minWidth: tokens.spacing[56] * 2,
          borderRadius: tokens.borderRadius.lg,
          paddingHorizontal: tokens.spacing[16],
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: tokens.componentStates.button.enabled.backgroundColor,
          ...tokens.shadows.z2,
        }}
      >
        <Text
          style={{
            color: tokens.componentStates.button.enabled.textColor,
            ...toTextStyle(tokens.typography.titleMedium),
          }}
        >
          {addDoseLabel}
        </Text>
      </Pressable>
    </View>
  );
};

const DailyDoseTimeline: React.FC<DailyDoseTimelineProps> = ({
  onAddDosePress,
  addDoseLabel = 'Add Dose',
  testID,
}) => {
  const { settings } = useTaperSettings();
  const { doses, totalDoses, commonUnit } = useDoses();
  const tokens = useDesignTokens();
  const navigation = useNavigation<NavigationProp<Record<string, object | undefined>>>();

  const resolvedUnit = settings.unit || commonUnit;

  const calendarEntries = useMemo<RollingCalendarWeekEntry[]>(() => {
    return doses.map((dose) => ({
      date: dose.date?.toDate ? dose.date.toDate() : new Date(),
      doseTaken: dose.amount,
      targetDose: settings.targetDose,
      unit: dose.doseUnit || resolvedUnit,
    }));
  }, [doses, settings.targetDose, resolvedUnit]);

  const timelineEntries = useMemo(
    () =>
      buildDailyDoseTimelineEntries(doses, {
        fallbackUnit: resolvedUnit,
      }),
    [doses, resolvedUnit]
  );

  const handleAddDosePress = () => {
    if (onAddDosePress) {
      onAddDosePress();
      return;
    }

    navigation.navigate('Dose', { mode: 'add' });
  };

  const handleEditDosePress = (entry: DailyDoseTimelineEntry) => {
    if (!entry.doseId) {
      return;
    }

    navigation.navigate('Dose', { mode: 'edit', doseId: entry.doseId });
  };

  const renderTimelineEntry: ListRenderItem<DailyDoseTimelineEntry> = ({ item, index }) => (
    <TimelineEntryItem
      entry={item}
      isFirst={index === 0}
      isLast={index === timelineEntries.length - 1}
      onPress={() => handleEditDosePress(item)}
    />
  );

  return (
    <FlatList
      testID={testID}
      data={timelineEntries}
      keyExtractor={(item) => item.key}
      contentContainerStyle={{ paddingBottom: tokens.spacing[24] }}
      ItemSeparatorComponent={() => <View style={{ height: tokens.spacing[8] }} />}
      renderItem={renderTimelineEntry}
      ListHeaderComponent={(
        <TimelineListHeader
          currentDose={totalDoses}
          targetDose={settings.targetDose}
          unit={resolvedUnit}
          calendarEntries={calendarEntries}
          onAddDosePress={handleAddDosePress}
          addDoseLabel={addDoseLabel}
        />
      )}
      ListEmptyComponent={
        <TimelineEmptyState onAddDosePress={handleAddDosePress} addDoseLabel={addDoseLabel} />
      }
    />
  );
};

const styles = StyleSheet.create({
  timelineEntryRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  timelineRail: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryCard: {
    flex: 1,
  },
  entryMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
});

export default DailyDoseTimeline;
