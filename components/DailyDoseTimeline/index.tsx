import React, { useMemo } from 'react';
import {
  Alert,
  FlatList,
  ListRenderItem,
  Pressable,
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
} from './helpers';
import DoseCard from './DoseCard';

export interface DailyDoseTimelineProps {
  onAddDosePress?: () => void;
  addDoseLabel?: string;
  testID?: string;
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
  const { doses, totalDoses, commonUnit, deleteDose } = useDoses();
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

  const handleDeleteDosePress = (entry: DailyDoseTimelineEntry) => {
    const doseId = entry.doseId;

    if (!doseId) {
      return;
    }

    Alert.alert(
      'Delete this dose?',
      undefined,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void deleteDose(doseId);
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderTimelineEntry: ListRenderItem<DailyDoseTimelineEntry> = ({ item, index }) => (
    <DoseCard
      entry={item}
      isFirst={index === 0}
      isLast={index === timelineEntries.length - 1}
      onPress={() => handleEditDosePress(item)}
      onDeletePress={() => handleDeleteDosePress(item)}
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

export default DailyDoseTimeline;
