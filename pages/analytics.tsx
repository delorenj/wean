import React, { useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Card, Chip, SegmentedButtons, Text } from 'react-native-paper';
import useDesignTokens from '../hooks/useDesignTokens';
import { useRevenueCat } from '../hooks/useRevenueCat';
import { Paywall } from '../components/Paywall';
import { useDoses } from '../hooks/useDoses';
import { useDaily } from '../context/dailyProvider';
import WeeklyTrendChart from '../components/WeeklyTrendChart';
import MonthlyTrendChart from '../components/MonthlyTrendChart';
import { BestWeekSummary, buildTrendAnalytics, TrendMetrics } from './analytics.helpers';

type AnalyticsRange = 'weekly' | 'monthly';

const usePremiumAccess = () => {
  try {
    const { isProUser, isLoading } = useRevenueCat();

    return {
      isLoading,
      isPremiumUnlocked: Platform.OS === 'web' || isProUser,
    };
  } catch {
    return {
      isLoading: false,
      isPremiumUnlocked: true,
    };
  }
};

const METRIC_LABELS = {
  averageDailyDose: 'Avg daily dose',
  reductionRatePercent: 'Reduction rate',
  streakDays: 'Streak days',
  bestWeek: 'Best week',
};

const formatBestWeek = (bestWeek: BestWeekSummary | null, unit: string): string => {
  if (!bestWeek) {
    return '—';
  }

  return `${bestWeek.averageDailyDose.toFixed(2)} ${unit}/day`;
};

const formatBestWeekRange = (bestWeek: BestWeekSummary | null): string => {
  if (!bestWeek) {
    return 'No full week in range yet';
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });

  const start = formatter.format(new Date(`${bestWeek.weekStartISO}T00:00:00.000Z`));
  const end = formatter.format(new Date(`${bestWeek.weekEndISO}T00:00:00.000Z`));

  return `${start} → ${end}`;
};

const renderMetricCards = (
  metrics: TrendMetrics,
  unit: string,
  colors: ReturnType<typeof useDesignTokens>['colors'],
  typography: ReturnType<typeof useDesignTokens>['typography'],
  borderRadius: ReturnType<typeof useDesignTokens>['borderRadius'],
  spacing: ReturnType<typeof useDesignTokens>['spacing']
) => {
  const metricRows = [
    {
      key: 'averageDailyDose',
      label: METRIC_LABELS.averageDailyDose,
      value: `${metrics.averageDailyDose.toFixed(2)} ${unit}`,
      detail: 'In selected range',
    },
    {
      key: 'reductionRatePercent',
      label: METRIC_LABELS.reductionRatePercent,
      value: `${metrics.reductionRatePercent.toFixed(1)}%`,
      detail: 'Start → latest day',
    },
    {
      key: 'streakDays',
      label: METRIC_LABELS.streakDays,
      value: `${metrics.streakDays} days`,
      detail: 'Consecutive non-increase days',
    },
    {
      key: 'bestWeek',
      label: METRIC_LABELS.bestWeek,
      value: formatBestWeek(metrics.bestWeek, unit),
      detail: formatBestWeekRange(metrics.bestWeek),
    },
  ];

  return (
    <View style={{ gap: spacing[8] }}>
      {metricRows.map((metric) => (
        <View
          key={metric.key}
          style={{
            borderWidth: 1,
            borderColor: colors.neutral[200],
            borderRadius: borderRadius.md,
            backgroundColor: colors.surface,
            paddingVertical: spacing[8],
            paddingHorizontal: spacing[12],
            gap: spacing[2],
          }}
        >
          <Text
            style={{
              color: colors.onSurfaceVariant,
              fontSize: typography.labelSmall.fontSize,
              lineHeight: typography.labelSmall.lineHeight,
              fontWeight: typography.labelSmall.fontWeight as '500',
            }}
          >
            {metric.label}
          </Text>
          <Text
            style={{
              color: colors.onSurface,
              fontSize: typography.titleMedium.fontSize,
              lineHeight: typography.titleMedium.lineHeight,
              fontWeight: typography.titleMedium.fontWeight as '500',
            }}
          >
            {metric.value}
          </Text>
          <Text
            style={{
              color: colors.onSurfaceVariant,
              fontSize: typography.bodySmall.fontSize,
              lineHeight: typography.bodySmall.lineHeight,
              fontWeight: typography.bodySmall.fontWeight as '400',
            }}
          >
            {metric.detail}
          </Text>
        </View>
      ))}
    </View>
  );
};

export const AnalyticsPage = () => {
  const { colors, spacing, typography, borderRadius } = useDesignTokens();
  const { selectedDate } = useDaily();
  const { doseHistory, commonUnit } = useDoses();

  const premiumAccess = usePremiumAccess();
  const [activeRange, setActiveRange] = useState<AnalyticsRange>('weekly');

  const analyticsSnapshot = useMemo(
    () =>
      buildTrendAnalytics(doseHistory, {
        endDate: selectedDate || new Date(),
        unit: commonUnit,
      }),
    [doseHistory, selectedDate, commonUnit]
  );

  const activeMetrics = activeRange === 'weekly'
    ? analyticsSnapshot.weekly.metrics
    : analyticsSnapshot.monthly.metrics;

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
        card: {
          borderRadius: borderRadius.lg,
          borderWidth: 1,
          borderColor: colors.neutral[200],
          backgroundColor: colors.surface,
        },
      }),
    [borderRadius.lg, colors, spacing, typography]
  );

  if (premiumAccess.isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[12] }}>
          <ActivityIndicator size="large" />
          <Text style={{ color: colors.onSurfaceVariant }}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!premiumAccess.isPremiumUnlocked) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, padding: spacing[16], gap: spacing[16] }}>
          <View>
            <Text style={styles.pageTitle}>Trend Analytics</Text>
            <Text style={styles.pageSubtitle}>
              Premium unlock: weekly/monthly trend charts, reduction metrics, and best-week insights.
            </Text>
          </View>
          <Paywall />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View>
          <Text style={styles.pageTitle}>Trend Analytics</Text>
          <Text style={styles.pageSubtitle}>
            Track your taper momentum with rolling averages and month-over-month progress.
          </Text>
        </View>

        <SegmentedButtons
          value={activeRange}
          onValueChange={(value) => setActiveRange(value as AnalyticsRange)}
          buttons={[
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' },
          ]}
        />

        <Card style={styles.card}>
          <Card.Title title="Key metrics" subtitle="Personalized from your dose history" />
          <Card.Content>
            {renderMetricCards(activeMetrics, commonUnit, colors, typography, borderRadius, spacing)}
          </Card.Content>
        </Card>

        {activeRange === 'weekly' ? (
          <WeeklyTrendChart
            dailyTotals={analyticsSnapshot.weekly.dailyTotals}
            rollingAverage={analyticsSnapshot.weekly.rollingAverage}
            unit={commonUnit}
            testID="weekly-trend-chart"
          />
        ) : (
          <>
            <MonthlyTrendChart
              dailyTotals={analyticsSnapshot.monthly.dailyTotals}
              rollingAverage={analyticsSnapshot.monthly.rollingAverage}
              unit={commonUnit}
              testID="monthly-trend-chart"
            />

            <Card style={styles.card}>
              <Card.Title title="Week-over-week comparison" subtitle="Latest 7 days vs previous 7 days" />
              <Card.Content style={{ gap: spacing[8] }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: colors.onSurfaceVariant }}>Current week total</Text>
                  <Text style={{ color: colors.onSurface }}>
                    {analyticsSnapshot.monthly.weekOverWeek.currentWeekTotal.toFixed(2)} {commonUnit}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: colors.onSurfaceVariant }}>Previous week total</Text>
                  <Text style={{ color: colors.onSurface }}>
                    {analyticsSnapshot.monthly.weekOverWeek.previousWeekTotal.toFixed(2)} {commonUnit}
                  </Text>
                </View>
                <Chip
                  icon={analyticsSnapshot.monthly.weekOverWeek.delta <= 0 ? 'trending-down' : 'trending-up'}
                  style={{ alignSelf: 'flex-start' }}
                >
                  {analyticsSnapshot.monthly.weekOverWeek.delta <= 0 ? 'Down' : 'Up'}{' '}
                  {Math.abs(analyticsSnapshot.monthly.weekOverWeek.percentChange).toFixed(1)}%
                </Chip>
              </Card.Content>
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AnalyticsPage;
