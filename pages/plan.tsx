import React, { useEffect, useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  Divider,
  List,
  SegmentedButtons,
  Snackbar,
  Text,
  TextInput,
} from 'react-native-paper';
import useDesignTokens from '../hooks/useDesignTokens';
import { useDoses } from '../hooks/useDoses';
import { useDaily } from '../context/dailyProvider';
import { useTaperSettings } from '../hooks/useTaperSettings';
import { useAppTheme } from '../context/themeProvider';
import { Paywall } from '../components/Paywall';
import { useRevenueCat } from '../hooks/useRevenueCat';
import TaperCurveChart from '../components/TaperCurveChart';
import {
  buildDoseChangeReminders,
  compareActualToPlannedDose,
  generateSmartTaperPlan,
  getPlannedDoseForDate,
  getPlanDayIndexForDate,
  getStrategyDefaults,
  SmartTaperPlan,
  TaperStrategy,
} from './plan.helpers';
import {
  clearSmartTaperPlan,
  loadSmartTaperPlan,
  saveSmartTaperPlan,
} from '../utils/smartTaperPlanStorage';

const DEFAULT_SUBSTANCES = ['Kratom', 'Nicotine', 'THC'];

const toNumericInput = (value: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

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

export const PlanPage = () => {
  const { colors, spacing, typography, borderRadius } = useDesignTokens();
  const { totalDoses } = useDoses();
  const { selectedDate } = useDaily();
  const { updateSettings } = useTaperSettings();
  const {
    settings: { notificationsEnabled },
  } = useAppTheme();

  const premiumAccess = usePremiumAccess();

  const [isLoadingPlan, setIsLoadingPlan] = useState(true);
  const [activePlan, setActivePlan] = useState<SmartTaperPlan | null>(null);

  const [substance, setSubstance] = useState(DEFAULT_SUBSTANCES[0]);
  const [currentDoseInput, setCurrentDoseInput] = useState('20');
  const [targetDoseInput, setTargetDoseInput] = useState('5');
  const [timelineDaysInput, setTimelineDaysInput] = useState('56');
  const [unitInput, setUnitInput] = useState('g');
  const [strategy, setStrategy] = useState<TaperStrategy>('gradual');
  const [reductionPercentInput, setReductionPercentInput] = useState('5');
  const [reductionEveryDaysInput, setReductionEveryDaysInput] = useState('7');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadPlan = async () => {
      const storedPlan = await loadSmartTaperPlan();

      if (!mounted) {
        return;
      }

      if (storedPlan) {
        setActivePlan(storedPlan);
        setSubstance(storedPlan.substance);
        setCurrentDoseInput(storedPlan.currentDose.toString());
        setTargetDoseInput(storedPlan.targetDose.toString());
        setTimelineDaysInput(storedPlan.timelineDays.toString());
        setUnitInput(storedPlan.unit);
        setStrategy(storedPlan.strategy);
        setReductionPercentInput(storedPlan.reductionPercent.toString());
        setReductionEveryDaysInput(storedPlan.reductionEveryDays.toString());
      }

      setIsLoadingPlan(false);
    };

    void loadPlan();

    return () => {
      mounted = false;
    };
  }, []);

  const plannedDoseForSelectedDate = useMemo(() => {
    if (!activePlan) {
      return null;
    }

    return getPlannedDoseForDate(activePlan, selectedDate || new Date());
  }, [activePlan, selectedDate]);

  const activeDayIndex = useMemo(() => {
    if (!activePlan) {
      return 0;
    }

    return getPlanDayIndexForDate(activePlan, selectedDate || new Date());
  }, [activePlan, selectedDate]);

  const doseComparison = useMemo(() => {
    if (plannedDoseForSelectedDate === null) {
      return null;
    }

    return compareActualToPlannedDose(totalDoses, plannedDoseForSelectedDate);
  }, [plannedDoseForSelectedDate, totalDoses]);

  const reminders = useMemo(() => {
    if (!activePlan) {
      return [];
    }

    return buildDoseChangeReminders(activePlan, new Date(), 4);
  }, [activePlan]);

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
          borderColor: colors.neutral[200],
          borderWidth: 1,
          backgroundColor: colors.surface,
        },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing[12],
        },
        doseDeltaText: {
          fontSize: typography.titleSmall.fontSize,
          lineHeight: typography.titleSmall.lineHeight,
          fontWeight: typography.titleSmall.fontWeight as '500',
        },
        helperText: {
          color: colors.onSurfaceVariant,
          fontSize: typography.bodySmall.fontSize,
          lineHeight: typography.bodySmall.lineHeight,
          fontWeight: typography.bodySmall.fontWeight as '400',
        },
      }),
    [borderRadius.lg, colors, spacing, typography]
  );

  const handleStrategyChange = (nextStrategy: TaperStrategy) => {
    setStrategy(nextStrategy);

    if (nextStrategy === 'custom') {
      return;
    }

    const defaults = getStrategyDefaults(nextStrategy);
    setReductionPercentInput(defaults.reductionPercent.toString());
    setReductionEveryDaysInput(defaults.reductionEveryDays.toString());
  };

  const handleGeneratePlan = async () => {
    setErrorMessage(null);

    try {
      const generatedPlan = generateSmartTaperPlan({
        substance,
        currentDose: toNumericInput(currentDoseInput),
        targetDose: toNumericInput(targetDoseInput),
        timelineDays: Math.floor(toNumericInput(timelineDaysInput)),
        unit: unitInput,
        strategy,
        reductionPercent: toNumericInput(reductionPercentInput),
        reductionEveryDays: Math.floor(toNumericInput(reductionEveryDaysInput)),
      });

      await saveSmartTaperPlan(generatedPlan);
      await updateSettings({
        startDose: generatedPlan.currentDose,
        targetDose: generatedPlan.targetDose,
        durationDays: generatedPlan.timelineDays,
        unit: generatedPlan.unit,
      });

      setActivePlan(generatedPlan);

      const upcomingReminder = buildDoseChangeReminders(generatedPlan, new Date(), 1)[0];
      if (upcomingReminder) {
        setSnackbarMessage(upcomingReminder.message);
      } else {
        setSnackbarMessage('Smart taper plan generated successfully.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate taper plan';
      setErrorMessage(message);
    }
  };

  const handleResetPlan = async () => {
    await clearSmartTaperPlan();
    setActivePlan(null);
    setSnackbarMessage('Taper plan cleared. You can generate a new one anytime.');
  };

  if (isLoadingPlan || premiumAccess.isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[12] }}>
          <ActivityIndicator size="large" />
          <Text style={styles.helperText}>Loading your planner...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!premiumAccess.isPremiumUnlocked) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, padding: spacing[16], gap: spacing[16] }}>
          <View>
            <Text style={styles.pageTitle}>Smart Taper Planner</Text>
            <Text style={styles.pageSubtitle}>
              Premium unlock: personalized taper algorithms, reminders, and planned vs actual tracking.
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
          <Text style={styles.pageTitle}>Smart Taper Planner</Text>
          <Text style={styles.pageSubtitle}>
            Build a personalized taper plan and compare your actual intake against daily targets.
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Title title="Plan setup" subtitle="Choose your substance, dose targets, and timeline" />
          <Card.Content style={{ gap: spacing[12] }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[8] }}>
              {DEFAULT_SUBSTANCES.map((option) => (
                <Chip
                  key={option}
                  selected={substance === option}
                  onPress={() => setSubstance(option)}
                >
                  {option}
                </Chip>
              ))}
            </View>

            <TextInput
              mode="outlined"
              label="Substance"
              value={substance}
              onChangeText={setSubstance}
            />

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

            <View style={styles.row}>
              <TextInput
                style={{ flex: 1 }}
                mode="outlined"
                label="Timeline (days)"
                keyboardType="number-pad"
                value={timelineDaysInput}
                onChangeText={setTimelineDaysInput}
              />
              <TextInput
                style={{ flex: 1 }}
                mode="outlined"
                label="Dose unit"
                value={unitInput}
                onChangeText={setUnitInput}
              />
            </View>

            <SegmentedButtons
              value={strategy}
              onValueChange={(value) => handleStrategyChange(value as TaperStrategy)}
              buttons={[
                { value: 'gradual', label: 'Gradual' },
                { value: 'aggressive', label: 'Aggressive' },
                { value: 'custom', label: 'Custom' },
              ]}
            />

            <View style={styles.row}>
              <TextInput
                style={{ flex: 1 }}
                mode="outlined"
                label="Reduce by (%)"
                keyboardType="decimal-pad"
                value={reductionPercentInput}
                onChangeText={setReductionPercentInput}
              />
              <TextInput
                style={{ flex: 1 }}
                mode="outlined"
                label="Every (days)"
                keyboardType="number-pad"
                value={reductionEveryDaysInput}
                onChangeText={setReductionEveryDaysInput}
              />
            </View>

            {errorMessage ? (
              <Text style={{ color: colors.error }}>{errorMessage}</Text>
            ) : null}

            <View style={[styles.row, { justifyContent: 'flex-end' }]}>
              {activePlan ? (
                <Button mode="text" onPress={() => void handleResetPlan()}>
                  Clear Plan
                </Button>
              ) : null}
              <Button mode="contained" onPress={() => void handleGeneratePlan()}>
                Generate Plan
              </Button>
            </View>
          </Card.Content>
        </Card>

        {activePlan ? (
          <>
            <Card style={styles.card}>
              <Card.Title title="Actual vs planned" subtitle={`Day ${activeDayIndex + 1} of ${activePlan.timelineDays}`} />
              <Card.Content style={{ gap: spacing[8] }}>
                {doseComparison ? (
                  <>
                    <View style={styles.row}>
                      <Text>Planned target</Text>
                      <Text>{doseComparison.plannedDose.toFixed(2)} {activePlan.unit}</Text>
                    </View>
                    <View style={styles.row}>
                      <Text>Actual logged</Text>
                      <Text>{doseComparison.actualDose.toFixed(2)} {activePlan.unit}</Text>
                    </View>
                    <Divider />
                    <View style={styles.row}>
                      <Text>Status</Text>
                      <Text
                        style={[
                          styles.doseDeltaText,
                          {
                            color:
                              doseComparison.status === 'over'
                                ? colors.error
                                : doseComparison.status === 'on-track'
                                ? colors.success
                                : colors.primary[600],
                          },
                        ]}
                      >
                        {doseComparison.status === 'on-track'
                          ? 'On track'
                          : `${doseComparison.delta > 0 ? '+' : ''}${doseComparison.delta.toFixed(2)} ${activePlan.unit}`}
                      </Text>
                    </View>
                  </>
                ) : null}
              </Card.Content>
            </Card>

            <TaperCurveChart
              plan={activePlan}
              activeDayIndex={activeDayIndex}
              actualDose={totalDoses}
              testID="taper-curve-chart"
            />

            <Card style={styles.card}>
              <Card.Title title="Dose-change reminders" subtitle="Notifications for days when your target changes" />
              <Card.Content>
                {!notificationsEnabled ? (
                  <Text style={{ color: colors.warning, marginBottom: spacing[8] }}>
                    Notifications are disabled in Settings. Enable them to get reminder nudges.
                  </Text>
                ) : null}

                {reminders.length === 0 ? (
                  <Text style={styles.helperText}>No upcoming dose changes to remind yet.</Text>
                ) : (
                  reminders.map((reminder) => (
                    <List.Item
                      key={`${reminder.dateISO}-${reminder.day}`}
                      title={`Day ${reminder.day} · ${reminder.dateISO}`}
                      description={`New target: ${reminder.targetDose}${activePlan.unit}`}
                      left={(props) => <List.Icon {...props} icon="bell-ring-outline" />}
                    />
                  ))
                )}
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Title title="Upcoming schedule" subtitle="Next 14 taper targets" />
              <Card.Content>
                {activePlan.schedule.slice(activeDayIndex, activeDayIndex + 14).map((day) => (
                  <List.Item
                    key={day.day}
                    title={`Day ${day.day} · ${day.dateISO}`}
                    description={`${day.targetDose}${activePlan.unit}${day.isDoseChangeDay ? ' · dose change' : ''}`}
                    left={(props) => <List.Icon {...props} icon={day.isDoseChangeDay ? 'calendar-sync' : 'calendar'} />}
                  />
                ))}
              </Card.Content>
            </Card>
          </>
        ) : null}
      </ScrollView>

      <Snackbar
        visible={Boolean(snackbarMessage)}
        duration={3000}
        onDismiss={() => setSnackbarMessage(null)}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
};

export default PlanPage;
