import React, { useEffect, useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  SegmentedButtons,
  Snackbar,
  Text,
  TextInput,
} from 'react-native-paper';
import useDesignTokens from '../hooks/useDesignTokens';
import { useRevenueCat } from '../hooks/useRevenueCat';
import { Paywall } from '../components/Paywall';
import ScreenTransition from '../components/ScreenTransition';
import useTaperPlan from '../hooks/useTaperPlan';
import { TaperStrategy } from '../hooks/useTaperPlan.helpers';
import { useDoses } from '../hooks/useDoses';
import { useDaily } from '../context/dailyProvider';
import { getCardSurfaceStyle } from '../src/theme';

const parseNumericInput = (value: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

const parseIntegerInput = (value: string): number => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return Number.NaN;
  }

  return Math.floor(parsed);
};

const formatDateForDisplay = (value: string): string => {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed);
};

const toDateISO = (date: Date): string => date.toISOString().split('T')[0];

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

export const TaperPlanPage = () => {
  const tokens = useDesignTokens();
  const { colors, spacing, typography, borderRadius } = tokens;
  const cardSurfaceStyle = getCardSurfaceStyle(tokens);
  const premiumAccess = usePremiumAccess();

  const {
    plan,
    isLoading,
    error,
    adherenceEntries,
    savePlan,
    regeneratePlanFromDeviation,
    getTargetForDate,
    getDeviationForDate,
    clearPlan,
  } = useTaperPlan(premiumAccess.isPremiumUnlocked);
  const { totalDoses } = useDoses();
  const { selectedDate } = useDaily();

  const [currentDoseInput, setCurrentDoseInput] = useState('');
  const [targetDoseInput, setTargetDoseInput] = useState('0');
  const [timelineDaysInput, setTimelineDaysInput] = useState('56');
  const [strategy, setStrategy] = useState<TaperStrategy>('linear');
  const [stepIntervalDaysInput, setStepIntervalDaysInput] = useState('7');
  const [percentageReductionInput, setPercentageReductionInput] = useState('10');
  const [scheduleView, setScheduleView] = useState<'daily' | 'weekly'>('daily');
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!plan) {
      return;
    }

    setCurrentDoseInput(plan.currentDose.toString());
    setTargetDoseInput(plan.targetDose.toString());
    setTimelineDaysInput(plan.timelineDays.toString());
    setStrategy(plan.strategy);
    setStepIntervalDaysInput(plan.strategyConfig.stepIntervalDays.toString());

    if (plan.strategyConfig.percentageReductionPerStep) {
      setPercentageReductionInput(plan.strategyConfig.percentageReductionPerStep.toFixed(2));
    }
  }, [plan]);

  const adherenceByDate = useMemo(() => {
    return adherenceEntries.reduce<Record<string, (typeof adherenceEntries)[number]>>((accumulator, entry) => {
      accumulator[entry.dateISO] = entry;
      return accumulator;
    }, {});
  }, [adherenceEntries]);

  const effectiveSelectedDate = selectedDate || new Date();
  const selectedDateISO = toDateISO(effectiveSelectedDate);

  const selectedDateTarget = useMemo(() => getTargetForDate(effectiveSelectedDate), [effectiveSelectedDate, getTargetForDate]);

  const selectedDateDeviation = useMemo(
    () => (selectedDateTarget === null ? null : getDeviationForDate(effectiveSelectedDate, totalDoses)),
    [effectiveSelectedDate, getDeviationForDate, selectedDateTarget, totalDoses]
  );

  const currentDayIndex = useMemo(() => {
    if (!plan) {
      return 0;
    }

    const index = plan.dailyTargets.findIndex((target) => target.dateISO === selectedDateISO);
    return index >= 0 ? index : 0;
  }, [plan, selectedDateISO]);

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
          ...cardSurfaceStyle,
        },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing[12],
        },
        helperText: {
          color: colors.onSurfaceVariant,
          fontSize: typography.bodySmall.fontSize,
          lineHeight: typography.bodySmall.lineHeight,
          fontWeight: typography.bodySmall.fontWeight as '400',
        },
      }),
    [cardSurfaceStyle, colors, spacing, typography]
  );

  const handleSavePlan = async () => {
    setFormError(null);

    const parsedCurrentDose = parseNumericInput(currentDoseInput);
    const parsedTargetDose = parseNumericInput(targetDoseInput);
    const parsedTimelineDays = parseIntegerInput(timelineDaysInput);
    const parsedIntervalDays = parseIntegerInput(stepIntervalDaysInput);
    const parsedPercentage = parseNumericInput(percentageReductionInput);

    if (!Number.isFinite(parsedCurrentDose) || parsedCurrentDose <= 0) {
      setFormError('Current dose must be greater than 0.');
      return;
    }

    if (!Number.isFinite(parsedTargetDose) || parsedTargetDose < 0) {
      setFormError('Target dose must be a non-negative number.');
      return;
    }

    if (!Number.isFinite(parsedTimelineDays) || parsedTimelineDays < 2) {
      setFormError('Timeline must be at least 2 days.');
      return;
    }

    if (!Number.isFinite(parsedIntervalDays) || parsedIntervalDays < 1) {
      setFormError('Step interval must be at least 1 day.');
      return;
    }

    if (strategy === 'percentage' && (!Number.isFinite(parsedPercentage) || parsedPercentage <= 0)) {
      setFormError('Percentage reduction must be greater than 0 for percentage strategy.');
      return;
    }

    setIsSaving(true);

    try {
      await savePlan({
        currentDose: parsedCurrentDose,
        targetDose: parsedTargetDose,
        timelineDays: parsedTimelineDays,
        strategy,
        stepIntervalDays: parsedIntervalDays,
        percentageReductionPerStep: strategy === 'percentage' ? parsedPercentage : undefined,
      });

      setStatusMessage('Smart taper plan generated and saved.');
    } catch (saveError) {
      setFormError(saveError instanceof Error ? saveError.message : 'Failed to save taper plan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerateFromDeviation = async () => {
    setFormError(null);

    if (!selectedDateDeviation) {
      setFormError('No date-specific deviation available to regenerate from.');
      return;
    }

    setIsRegenerating(true);

    try {
      await regeneratePlanFromDeviation({
        actualDose: totalDoses,
        asOfDate: effectiveSelectedDate,
        reason: 'user-adjustment-after-deviation',
      });

      setStatusMessage('Plan regenerated from your actual logged dose.');
    } catch (regenerationError) {
      setFormError(
        regenerationError instanceof Error ? regenerationError.message : 'Failed to regenerate plan.'
      );
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleClearPlan = async () => {
    setFormError(null);

    try {
      await clearPlan();
      setStatusMessage('Taper plan cleared.');
    } catch (clearError) {
      setFormError(clearError instanceof Error ? clearError.message : 'Failed to clear taper plan.');
    }
  };

  if (isLoading || premiumAccess.isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[12] }}>
          <ActivityIndicator size="large" />
          <Text style={styles.helperText}>Loading taper planner...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!premiumAccess.isPremiumUnlocked) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, padding: spacing[16], gap: spacing[16] }}>
          <ScreenTransition delay={20}>
            <View>
              <Text style={styles.pageTitle}>Smart Taper Planner</Text>
              <Text style={styles.pageSubtitle}>
                Premium unlock: personalized taper strategies, schedule visualization, and plan-vs-actual tracking.
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
            <Text style={styles.pageTitle}>Smart Taper Planner</Text>
            <Text style={styles.pageSubtitle}>
              Build a plan with linear, stepped, or percentage-based reductions and adapt quickly if you deviate.
            </Text>
          </View>
        </ScreenTransition>

        <ScreenTransition delay={70}>
          <Card style={styles.card}>
          <Card.Title title="Plan wizard" subtitle="1) Dose + timeline  2) Strategy  3) Generate" />
          <Card.Content style={{ gap: spacing[12] }}>
            <View style={styles.row}>
              <TextInput
                style={{ flex: 1 }}
                mode="outlined"
                label="Current dose"
                keyboardType="decimal-pad"
                value={currentDoseInput}
                onChangeText={setCurrentDoseInput}
              />
              <TextInput
                style={{ flex: 1 }}
                mode="outlined"
                label="Target dose"
                keyboardType="decimal-pad"
                value={targetDoseInput}
                onChangeText={setTargetDoseInput}
              />
            </View>

            <TextInput
              mode="outlined"
              label="Timeline (days)"
              keyboardType="number-pad"
              value={timelineDaysInput}
              onChangeText={setTimelineDaysInput}
            />

            <SegmentedButtons
              value={strategy}
              onValueChange={(value) => setStrategy(value as TaperStrategy)}
              buttons={[
                { value: 'linear', label: 'Linear' },
                { value: 'stepped', label: 'Stepped' },
                { value: 'percentage', label: 'Percentage' },
              ]}
            />

            {(strategy === 'stepped' || strategy === 'percentage') && (
              <TextInput
                mode="outlined"
                label="Adjustment interval (days)"
                keyboardType="number-pad"
                value={stepIntervalDaysInput}
                onChangeText={setStepIntervalDaysInput}
              />
            )}

            {strategy === 'percentage' && (
              <TextInput
                mode="outlined"
                label="Reduction per step (%)"
                keyboardType="decimal-pad"
                value={percentageReductionInput}
                onChangeText={setPercentageReductionInput}
              />
            )}

            {formError || error ? <Text style={{ color: colors.error }}>{formError || error}</Text> : null}

            <View style={[styles.row, { justifyContent: 'flex-end' }]}>
              {plan ? (
                <Button mode="text" onPress={() => void handleClearPlan()}>
                  Clear Plan
                </Button>
              ) : null}
              <Button mode="contained" onPress={() => void handleSavePlan()} loading={isSaving}>
                {plan ? 'Regenerate Plan' : 'Generate Plan'}
              </Button>
            </View>
          </Card.Content>
          </Card>
        </ScreenTransition>

        {plan ? (
          <>
            <ScreenTransition delay={120}>
              <Card style={styles.card}>
                <Card.Title title="Selected day: target vs actual" subtitle={formatDateForDisplay(selectedDateISO)} />
              <Card.Content style={{ gap: spacing[8] }}>
                <View style={styles.row}>
                  <Text style={styles.helperText}>Plan target</Text>
                  <Text>{selectedDateTarget === null ? '—' : selectedDateTarget.toFixed(2)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.helperText}>Logged actual</Text>
                  <Text>{totalDoses.toFixed(2)}</Text>
                </View>

                {selectedDateDeviation ? (
                  <View style={[styles.row, { alignItems: 'center' }]}>
                    <Chip
                      icon={
                        selectedDateDeviation.status === 'on-track'
                          ? 'check-circle-outline'
                          : selectedDateDeviation.status === 'over'
                          ? 'alert-circle-outline'
                          : 'arrow-down-circle-outline'
                      }
                      style={{
                        backgroundColor:
                          selectedDateDeviation.status === 'on-track'
                            ? `${colors.success}22`
                            : selectedDateDeviation.status === 'over'
                            ? `${colors.error}22`
                            : `${colors.warning}22`,
                      }}
                    >
                      {selectedDateDeviation.status === 'on-track'
                        ? 'On track'
                        : `${selectedDateDeviation.delta > 0 ? '+' : ''}${selectedDateDeviation.delta.toFixed(2)} deviation`}
                    </Chip>

                    {selectedDateDeviation.status !== 'on-track' ? (
                      <Button
                        mode="outlined"
                        compact
                        loading={isRegenerating}
                        onPress={() => void handleRegenerateFromDeviation()}
                      >
                        Adjust Plan
                      </Button>
                    ) : null}
                  </View>
                ) : (
                  <Text style={styles.helperText}>No plan target exists for the selected date.</Text>
                )}
              </Card.Content>
              </Card>
            </ScreenTransition>

            <ScreenTransition delay={170}>
              <Card style={styles.card}>
              <Card.Title
                title="Schedule visualization"
                subtitle={`Plan runs ${formatDateForDisplay(plan.startDateISO)} → ${formatDateForDisplay(
                  plan.estimatedCompletionDateISO
                )}`}
              />
              <Card.Content style={{ gap: spacing[10] }}>
                <SegmentedButtons
                  value={scheduleView}
                  onValueChange={(value) => setScheduleView(value as 'daily' | 'weekly')}
                  buttons={[
                    { value: 'daily', label: 'Daily targets' },
                    { value: 'weekly', label: 'Weekly targets' },
                  ]}
                />

                {scheduleView === 'daily'
                  ? plan.dailyTargets.slice(currentDayIndex, currentDayIndex + 21).map((target) => {
                      const adherence = adherenceByDate[target.dateISO];

                      return (
                        <View
                          key={`${target.day}-${target.dateISO}`}
                          style={{
                            borderWidth: 1,
                            borderColor: colors.neutral[200],
                            borderRadius: borderRadius.md,
                            backgroundColor: colors.surfaceVariant,
                            padding: spacing[10],
                            gap: spacing[6],
                          }}
                        >
                          <View style={styles.row}>
                            <Text style={{ fontWeight: '600' }}>
                              Day {target.day} · {formatDateForDisplay(target.dateISO)}
                            </Text>
                            <Text>{target.targetDose.toFixed(2)}</Text>
                          </View>

                          <View style={styles.row}>
                            <Text style={styles.helperText}>Progress</Text>
                            <Text>{target.progressPercentage.toFixed(0)}%</Text>
                          </View>

                          <View style={styles.row}>
                            <Text style={styles.helperText}>Actual logged</Text>
                            <Text>{adherence ? adherence.actualDose.toFixed(2) : '—'}</Text>
                          </View>

                          <View style={styles.row}>
                            <Text style={styles.helperText}>Status</Text>
                            {adherence ? (
                              <Chip compact>
                                {adherence.status === 'on-track'
                                  ? 'On track'
                                  : adherence.status === 'over'
                                  ? 'Over target'
                                  : 'Under target'}
                              </Chip>
                            ) : (
                              <Text style={styles.helperText}>No logged dose</Text>
                            )}
                          </View>
                        </View>
                      );
                    })
                  : plan.weeklyTargets.map((target) => (
                      <View
                        key={`${target.week}-${target.startDateISO}`}
                        style={{
                          borderWidth: 1,
                          borderColor: colors.neutral[200],
                          borderRadius: borderRadius.md,
                          backgroundColor: colors.surfaceVariant,
                          padding: spacing[10],
                          gap: spacing[6],
                        }}
                      >
                        <View style={styles.row}>
                          <Text style={{ fontWeight: '600' }}>Week {target.week}</Text>
                          <Text>
                            Day {target.startDay}–{target.endDay}
                          </Text>
                        </View>

                        <View style={styles.row}>
                          <Text style={styles.helperText}>Date range</Text>
                          <Text>
                            {formatDateForDisplay(target.startDateISO)} – {formatDateForDisplay(target.endDateISO)}
                          </Text>
                        </View>

                        <View style={styles.row}>
                          <Text style={styles.helperText}>Average target</Text>
                          <Text>{target.averageTargetDose.toFixed(2)}</Text>
                        </View>

                        <View style={styles.row}>
                          <Text style={styles.helperText}>Week dose range</Text>
                          <Text>
                            {target.startDose.toFixed(2)} → {target.endDose.toFixed(2)}
                          </Text>
                        </View>
                      </View>
                    ))}
              </Card.Content>
              </Card>
            </ScreenTransition>

            {plan.regenerationHistory.length ? (
              <ScreenTransition delay={220}>
                <Card style={styles.card}>
                <Card.Title title="Plan adjustments" subtitle="Regeneration history when deviations occurred" />
                <Card.Content style={{ gap: spacing[8] }}>
                  {plan.regenerationHistory
                    .slice()
                    .reverse()
                    .map((entry) => (
                      <View
                        key={`${entry.atISO}-${entry.actualDose}`}
                        style={{
                          borderWidth: 1,
                          borderColor: colors.neutral[200],
                          borderRadius: borderRadius.md,
                          backgroundColor: colors.surfaceVariant,
                          padding: spacing[10],
                        }}
                      >
                        <Text style={{ fontWeight: '600' }}>{formatDateForDisplay(entry.atISO)}</Text>
                        <Text style={styles.helperText}>
                          Actual dose {entry.actualDose.toFixed(2)} · Remaining timeline {entry.remainingDays} days
                        </Text>
                        <Text style={styles.helperText}>Reason: {entry.reason}</Text>
                      </View>
                    ))}
                </Card.Content>
                </Card>
              </ScreenTransition>
            ) : null}
          </>
        ) : null}
      </ScrollView>

      <Snackbar visible={Boolean(statusMessage)} duration={3000} onDismiss={() => setStatusMessage(null)}>
        {statusMessage}
      </Snackbar>
    </SafeAreaView>
  );
};

export default TaperPlanPage;
