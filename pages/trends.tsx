import React, { useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Card, SegmentedButtons, Text } from 'react-native-paper';
import { Paywall } from '../components/Paywall';
import ScreenTransition from '../components/ScreenTransition';
import { useAppTheme } from '../context/themeProvider';
import useDesignTokens from '../hooks/useDesignTokens';
import useAnalytics from '../hooks/useAnalytics';
import { getCardSurfaceStyle } from '../src/theme';
import { AnalyticsPeriodSnapshot } from '../hooks/useAnalytics.helpers';

type AnalyticsRange = 'weekly' | 'monthly';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const getTrendArrow = (direction: AnalyticsPeriodSnapshot['trend']['direction']): string => {
  if (direction === 'down') {
    return '↓';
  }

  if (direction === 'up') {
    return '↑';
  }

  return '→';
};

const getTrendLabel = (direction: AnalyticsPeriodSnapshot['trend']['direction']): string => {
  if (direction === 'down') {
    return 'Trending down (great taper momentum)';
  }

  if (direction === 'up') {
    return 'Trending up';
  }

  return 'Stable';
};

const formatBarLabel = (dateISO: string, range: AnalyticsRange, index: number): string => {
  const date = new Date(`${dateISO}T00:00:00.000Z`);

  if (range === 'weekly') {
    return DAY_LABELS[date.getUTCDay()] || '';
  }

  if (index % 5 === 0 || index === 29) {
    return String(date.getUTCDate()).padStart(2, '0');
  }

  return '';
};

const DoseBarChart = ({
  period,
  range,
  unit,
}: {
  period: AnalyticsPeriodSnapshot;
  range: AnalyticsRange;
  unit: string;
}) => {
  const tokens = useDesignTokens();
  const { colors, spacing, typography } = tokens;
  const cardSurfaceStyle = getCardSurfaceStyle(tokens);

  const maxDose = Math.max(...period.dailyTotals.map((entry) => entry.totalDose), 1);
  const barWidth = range === 'weekly' ? 28 : 10;

  return (
    <Card style={cardSurfaceStyle}>
      <Card.Title
        title={range === 'weekly' ? 'Last 7 days' : 'Last 30 days'}
        subtitle="Daily dose totals"
      />
      <Card.Content style={{ gap: spacing[10] }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              gap: spacing[4],
              minHeight: 170,
              paddingTop: spacing[12],
              paddingBottom: spacing[6],
              paddingRight: spacing[10],
            }}
          >
            {period.dailyTotals.map((entry, index) => {
              const normalizedHeight = entry.totalDose > 0
                ? Math.max((entry.totalDose / maxDose) * 120, 4)
                : 2;

              return (
                <View key={entry.dateISO} style={{ alignItems: 'center', width: barWidth }}>
                  <View
                    style={{
                      width: barWidth,
                      height: normalizedHeight,
                      borderRadius: 6,
                      backgroundColor: colors.primary[400],
                    }}
                  />
                  <Text
                    style={{
                      marginTop: spacing[4],
                      color: colors.onSurfaceVariant,
                      fontSize: typography.labelSmall.fontSize,
                      lineHeight: typography.labelSmall.lineHeight,
                      fontWeight: typography.labelSmall.fontWeight as '500',
                    }}
                  >
                    {formatBarLabel(entry.dateISO, range, index)}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>

        <Text
          style={{
            color: colors.onSurfaceVariant,
            fontSize: typography.bodySmall.fontSize,
            lineHeight: typography.bodySmall.lineHeight,
            fontWeight: typography.bodySmall.fontWeight as '400',
          }}
        >
          Peak in range: {maxDose.toFixed(2)} {unit}
        </Text>
      </Card.Content>
    </Card>
  );
};

export const TrendsPage = () => {
  const tokens = useDesignTokens();
  const { colors, spacing, typography, borderRadius } = tokens;
  const cardSurfaceStyle = getCardSurfaceStyle(tokens);
  const {
    settings: { defaultDoseUnit },
  } = useAppTheme();

  const [activeRange, setActiveRange] = useState<AnalyticsRange>('weekly');

  const {
    analytics,
    isLoading,
    error,
    isPremiumLoading,
    isPremiumUnlocked,
  } = useAnalytics(defaultDoseUnit);

  const activePeriod = activeRange === 'weekly' ? analytics.weekly : analytics.monthly;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safeArea: {
          flex: 1,
          backgroundColor: colors.surface,
        },
        content: {
          paddingHorizontal: spacing[16],
          paddingTop: spacing[12],
          paddingBottom: spacing[32],
          gap: spacing[16],
        },
        pageTitle: {
          color: colors.onSurface,
          fontSize: typography.headlineSmall.fontSize,
          lineHeight: typography.headlineSmall.lineHeight,
          fontWeight: typography.headlineSmall.fontWeight as '600',
        },
        pageSubtitle: {
          color: colors.onSurfaceVariant,
          fontSize: typography.bodyMedium.fontSize,
          lineHeight: typography.bodyMedium.lineHeight,
          fontWeight: typography.bodyMedium.fontWeight as '400',
          marginTop: spacing[4],
        },
        statCard: {
          flex: 1,
          ...cardSurfaceStyle,
          borderRadius: borderRadius.md,
          paddingVertical: spacing[10],
          paddingHorizontal: spacing[10],
          gap: spacing[4],
        },
      }),
    [borderRadius.md, cardSurfaceStyle, colors, spacing, typography]
  );

  if (isLoading || isPremiumLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[12] }}>
          <ActivityIndicator size="large" />
          <Text style={{ color: colors.onSurfaceVariant }}>Loading trends...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isPremiumUnlocked) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, padding: spacing[16], gap: spacing[16] }}>
          <ScreenTransition delay={30}>
            <View>
              <Text style={styles.pageTitle}>Trend Analytics</Text>
              <Text style={styles.pageSubtitle}>
                Premium unlock: weekly/monthly trend charts, average dose stats, trend direction, and reduction streaks.
              </Text>
            </View>
          </ScreenTransition>

          <ScreenTransition delay={90}>
            <Paywall />
          </ScreenTransition>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenTransition delay={20}>
          <View>
            <Text style={styles.pageTitle}>Trend Analytics</Text>
            <Text style={styles.pageSubtitle}>
              Track your daily totals, average dose, and taper momentum over weekly and monthly windows.
            </Text>
          </View>
        </ScreenTransition>

        <ScreenTransition delay={60}>
          <SegmentedButtons
            value={activeRange}
            onValueChange={(value) => setActiveRange(value as AnalyticsRange)}
            buttons={[
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
            ]}
          />
        </ScreenTransition>

        <ScreenTransition delay={100}>
          <View style={{ flexDirection: 'row', gap: spacing[8] }}>
            <View style={styles.statCard}>
              <Text style={{ color: colors.onSurfaceVariant, fontSize: typography.labelSmall.fontSize }}>
                Average dose
              </Text>
              <Text style={{ color: colors.onSurface, fontSize: typography.titleMedium.fontSize, fontWeight: '600' }}>
                {activePeriod.averageDailyDose.toFixed(2)} {defaultDoseUnit}
              </Text>
              <Text style={{ color: colors.onSurfaceVariant, fontSize: typography.bodySmall.fontSize }}>
                Per day ({activeRange === 'weekly' ? '7d' : '30d'})
              </Text>
            </View>

            <View style={styles.statCard}>
              <Text style={{ color: colors.onSurfaceVariant, fontSize: typography.labelSmall.fontSize }}>
                Trend
              </Text>
              <Text style={{ color: colors.onSurface, fontSize: typography.titleMedium.fontSize, fontWeight: '600' }}>
                {getTrendArrow(activePeriod.trend.direction)} {Math.abs(activePeriod.trend.deltaPercent).toFixed(1)}%
              </Text>
              <Text style={{ color: colors.onSurfaceVariant, fontSize: typography.bodySmall.fontSize }}>
                {getTrendLabel(activePeriod.trend.direction)}
              </Text>
            </View>

            <View style={styles.statCard}>
              <Text style={{ color: colors.onSurfaceVariant, fontSize: typography.labelSmall.fontSize }}>
                Reduction streak
              </Text>
              <Text style={{ color: colors.onSurface, fontSize: typography.titleMedium.fontSize, fontWeight: '600' }}>
                {activePeriod.reductionStreakDays}d
              </Text>
              <Text style={{ color: colors.onSurfaceVariant, fontSize: typography.bodySmall.fontSize }}>
                Consecutive days down
              </Text>
            </View>
          </View>
        </ScreenTransition>

        <ScreenTransition delay={140}>
          <DoseBarChart period={activePeriod} range={activeRange} unit={defaultDoseUnit} />
        </ScreenTransition>

        {error ? (
          <ScreenTransition delay={180}>
            <Card
              style={{
                ...cardSurfaceStyle,
                borderColor: colors.error,
                backgroundColor: Platform.OS === 'web' ? colors.surface : colors.surfaceVariant,
              }}
            >
              <Card.Content>
                <Text style={{ color: colors.error }}>Unable to refresh analytics: {error}</Text>
              </Card.Content>
            </Card>
          </ScreenTransition>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TrendsPage;
