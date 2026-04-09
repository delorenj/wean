import React, { useMemo } from 'react';
import { FlatList, ListRenderItem, Pressable, StyleSheet, Text, TextStyle, useWindowDimensions, View } from 'react-native';
import useDesignTokens from '../../hooks/useDesignTokens';
import { useDaily } from '../../context/dailyProvider';
import {
  buildRollingCalendarWeekDayStates,
  formatDoseAmount,
  isSameCalendarDay,
  RollingCalendarDayState,
  RollingCalendarDayStatus,
  RollingCalendarWeekEntry,
} from './helpers';

interface DailyContextValue {
  selectedDate?: Date;
  setSelectedDate?: (date: Date) => void;
}

export interface RollingCalendarWeekProps {
  entries?: RollingCalendarWeekEntry[];
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
  anchorDate?: Date;
  weekStartsOn?: number;
  weeksToShow?: number;
  defaultTargetDose?: number | null;
  unit?: string;
  dosePrecision?: number;
  testID?: string;
}

const toTextStyle = (
  typographyStyle: (typeof import('../../src/tokens').Typography)[keyof (typeof import('../../src/tokens').Typography)]
): TextStyle => typographyStyle as TextStyle;

const getStatusLabel = (status: RollingCalendarDayStatus): string => {
  if (status === 'future') {
    return 'Future';
  }

  if (status === 'warning') {
    return 'Over';
  }

  if (status === 'adherent') {
    return 'On plan';
  }

  if (status === 'logged') {
    return 'Logged';
  }

  return 'No dose';
};

const formatWeekRange = (days: RollingCalendarDayState[]): string => {
  if (days.length === 0) {
    return '';
  }

  const start = days[0].date;
  const end = days[days.length - 1].date;

  const startMonth = start.toLocaleDateString(undefined, { month: 'short' });
  const endMonth = end.toLocaleDateString(undefined, { month: 'short' });

  if (startMonth === endMonth) {
    return `${startMonth} ${start.getDate()} - ${end.getDate()}`;
  }

  return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}`;
};

export const RollingCalendarWeek: React.FC<RollingCalendarWeekProps> = ({
  entries = [],
  selectedDate,
  onSelectDate,
  anchorDate = new Date(),
  weekStartsOn = 0,
  weeksToShow = 12,
  defaultTargetDose = null,
  unit,
  dosePrecision = 1,
  testID,
}) => {
  const tokens = useDesignTokens();
  const { width: windowWidth } = useWindowDimensions();
  const dailyContext = useDaily() as DailyContextValue | null;

  const resolvedSelectedDate = selectedDate ?? dailyContext?.selectedDate ?? anchorDate;
  const weekOffsets = useMemo(
    () => Array.from({ length: Math.max(weeksToShow, 1) }, (_, index) => -index),
    [weeksToShow]
  );

  const horizontalInset = tokens.spacing[16];
  const weekCardPadding = tokens.spacing[12];
  const weekGap = tokens.spacing[8];
  const pageWidth = Math.max(
    windowWidth - horizontalInset * 2,
    tokens.spacing[56] * 4
  );

  const onDayPress = (date: Date): void => {
    onSelectDate?.(date);

    if (dailyContext?.setSelectedDate) {
      dailyContext.setSelectedDate(date);
    }
  };

  const renderWeek: ListRenderItem<number> = ({ item: weekOffset }) => {
    const days = buildRollingCalendarWeekDayStates({
      entries,
      anchorDate,
      weekOffset,
      weekStartsOn,
      defaultTargetDose,
      defaultUnit: unit,
    });

    return (
      <View
        style={[
          styles.weekCard,
          {
            width: pageWidth,
            marginRight: weekGap,
            padding: weekCardPadding,
            borderRadius: tokens.borderRadius.lg,
            backgroundColor: tokens.colors.surface,
            borderColor: tokens.colors.neutral[200],
            borderWidth: tokens.spacing[2],
          },
        ]}
      >
        <Text
          style={[
            styles.weekTitle,
            {
              color: tokens.colors.onSurface,
              marginBottom: tokens.spacing[12],
              ...toTextStyle(tokens.typography.titleSmall),
            },
          ]}
        >
          {formatWeekRange(days)}
        </Text>

        <View style={[styles.dayRow, { gap: tokens.spacing[6] }]}>
          {days.map((day) => {
            const isSelected = isSameCalendarDay(day.date, resolvedSelectedDate);
            const statusColor =
              day.status === 'warning'
                ? tokens.colors.warning
                : day.status === 'adherent'
                  ? tokens.colors.success
                  : day.status === 'future'
                    ? tokens.componentStates.button.disabled.textColor
                    : day.status === 'logged'
                      ? tokens.colors.primary[300]
                      : tokens.colors.neutral[300];

            const backgroundColor = day.isFuture
              ? tokens.componentStates.button.disabled.backgroundColor
              : day.isToday
                ? tokens.componentStates.card.active.backgroundColor
                : isSelected
                  ? tokens.componentStates.card.highlighted.backgroundColor
                  : tokens.colors.surfaceVariant;

            const borderColor = day.isOverTarget
              ? tokens.colors.warning
              : day.isToday
                ? tokens.componentStates.card.active.borderColor
                : isSelected
                  ? tokens.componentStates.card.highlighted.borderColor
                  : tokens.colors.neutral[200];

            const titleColor = day.isFuture
              ? tokens.componentStates.button.disabled.textColor
              : tokens.colors.onSurface;

            const bodyColor = day.isFuture
              ? tokens.componentStates.button.disabled.textColor
              : tokens.colors.onSurfaceVariant;

            const doseText = day.doseTaken === null
              ? '--'
              : `${formatDoseAmount(day.doseTaken, dosePrecision)}${day.unit ? ` ${day.unit}` : ''}`;

            return (
              <Pressable
                key={day.key}
                disabled={day.isFuture}
                onPress={() => onDayPress(day.date)}
                style={[
                  styles.dayCell,
                  {
                    paddingVertical: tokens.spacing[8],
                    paddingHorizontal: tokens.spacing[4],
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor,
                    borderColor,
                    borderWidth: tokens.spacing[2],
                  },
                ]}
              >
                <Text
                  style={[
                    styles.dayLabel,
                    {
                      color: titleColor,
                      ...toTextStyle(tokens.typography.labelMedium),
                    },
                  ]}
                >
                  {day.dayLabel}
                </Text>

                <Text
                  style={[
                    styles.dateLabel,
                    {
                      color: titleColor,
                      marginTop: tokens.spacing[4],
                      ...toTextStyle(tokens.typography.titleSmall),
                    },
                  ]}
                >
                  {day.dateLabel}
                </Text>

                <Text
                  style={[
                    styles.doseLabel,
                    {
                      color: bodyColor,
                      marginTop: tokens.spacing[4],
                      ...toTextStyle(tokens.typography.labelSmall),
                    },
                  ]}
                >
                  {doseText}
                </Text>

                <View
                  style={[
                    styles.indicatorRow,
                    {
                      marginTop: tokens.spacing[6],
                      gap: tokens.spacing[4],
                    },
                  ]}
                >
                  <View
                    style={{
                      width: tokens.spacing[8],
                      height: tokens.spacing[8],
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: statusColor,
                    }}
                  />
                  <Text
                    style={{
                      color: bodyColor,
                      ...toTextStyle(tokens.typography.labelSmall),
                    }}
                  >
                    {getStatusLabel(day.status)}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View
      testID={testID}
      style={{
        paddingHorizontal: horizontalInset,
        paddingVertical: tokens.spacing[8],
      }}
    >
      <FlatList
        data={weekOffsets}
        keyExtractor={(item) => item.toString()}
        horizontal
        pagingEnabled
        snapToAlignment="start"
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingRight: horizontalInset,
        }}
        renderItem={renderWeek}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  weekCard: {
    flexDirection: 'column',
  },
  weekTitle: {
    textAlign: 'left',
  },
  dayRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
  },
  dayLabel: {
    textAlign: 'center',
  },
  dateLabel: {
    textAlign: 'center',
  },
  doseLabel: {
    textAlign: 'center',
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export const Index = RollingCalendarWeek;
export default RollingCalendarWeek;
export type { RollingCalendarWeekEntry } from './helpers';
