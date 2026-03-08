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
import useTaperPlan from '../hooks/useTaperPlan';
import { TaperSpeed } from '../hooks/useTaperPlan.helpers';

const parseNumericInput = (value: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

const toTitleCase = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1);

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

export const TaperPage = () => {
  const { colors, spacing, typography, borderRadius } = useDesignTokens();
  const premiumAccess = usePremiumAccess();
  const { plan, isLoading, error, savePlan, clearPlan } = useTaperPlan(premiumAccess.isPremiumUnlocked);

  const [currentDoseInput, setCurrentDoseInput] = useState('');
  const [targetDoseInput, setTargetDoseInput] = useState('0');
  const [taperSpeed, setTaperSpeed] = useState<TaperSpeed>('moderate');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!plan) {
      return;
    }

    setCurrentDoseInput(plan.currentDose.toString());
    setTargetDoseInput(plan.targetDose.toString());
    setTaperSpeed(plan.taperSpeed);
  }, [plan]);

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
        helperText: {
          color: colors.onSurfaceVariant,
          fontSize: typography.bodySmall.fontSize,
          lineHeight: typography.bodySmall.lineHeight,
          fontWeight: typography.bodySmall.fontWeight as '400',
        },
      }),
    [borderRadius.lg, colors, spacing, typography]
  );

  const handleSavePlan = async () => {
    setFormError(null);

    const parsedCurrentDose = parseNumericInput(currentDoseInput);
    const parsedTargetDose = parseNumericInput(targetDoseInput);

    if (!Number.isFinite(parsedCurrentDose) || parsedCurrentDose <= 0) {
      setFormError('Current dose must be greater than 0.');
      return;
    }

    if (!Number.isFinite(parsedTargetDose) || parsedTargetDose < 0) {
      setFormError('Target dose must be a non-negative number.');
      return;
    }

    setIsSaving(true);

    try {
      await savePlan({
        currentDose: parsedCurrentDose,
        targetDose: parsedTargetDose,
        taperSpeed,
      });

      setStatusMessage('Smart taper plan saved.');
    } catch (saveError) {
      setFormError(saveError instanceof Error ? saveError.message : 'Failed to save taper plan.');
    } finally {
      setIsSaving(false);
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
          <View>
            <Text style={styles.pageTitle}>Smart Taper Planner</Text>
            <Text style={styles.pageSubtitle}>
              Premium unlock: personalized taper schedules, milestones, and progress guidance.
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
            Build a taper schedule with clinically-inspired pacing and clear milestone checkpoints.
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Title title="Plan setup" subtitle="Set your current dose, target dose, and taper speed" />
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

            <SegmentedButtons
              value={taperSpeed}
              onValueChange={(value) => setTaperSpeed(value as TaperSpeed)}
              buttons={[
                { value: 'aggressive', label: 'Aggressive' },
                { value: 'moderate', label: 'Moderate' },
                { value: 'gentle', label: 'Gentle' },
              ]}
            />

            <Text style={styles.helperText}>
              {taperSpeed === 'aggressive'
                ? 'Aggressive: 10% reduction every 3 days'
                : taperSpeed === 'moderate'
                ? 'Moderate: 10% reduction every 7 days'
                : 'Gentle: 5% reduction every 7 days'}
            </Text>

            {formError || error ? <Text style={{ color: colors.error }}>{formError || error}</Text> : null}

            <View style={[styles.row, { justifyContent: 'flex-end' }]}>
              {plan ? (
                <Button mode="text" onPress={() => void handleClearPlan()}>
                  Clear Plan
                </Button>
              ) : null}
              <Button mode="contained" onPress={() => void handleSavePlan()} loading={isSaving}>
                {plan ? 'Update Plan' : 'Generate Plan'}
              </Button>
            </View>
          </Card.Content>
        </Card>

        {plan ? (
          <>
            <Card style={styles.card}>
              <Card.Title title="Plan summary" subtitle="Your active taper schedule" />
              <Card.Content style={{ gap: spacing[8] }}>
                <View style={styles.row}>
                  <Text style={styles.helperText}>Starting dose</Text>
                  <Text>{plan.currentDose.toFixed(2)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.helperText}>Target dose</Text>
                  <Text>{plan.targetDose.toFixed(2)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.helperText}>Taper speed</Text>
                  <Text>{toTitleCase(plan.taperSpeed)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.helperText}>Estimated completion</Text>
                  <Text>{formatDateForDisplay(plan.estimatedCompletionDateISO)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.helperText}>Total taper days</Text>
                  <Text>{plan.totalDays}</Text>
                </View>
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Title title="Milestones" subtitle="Celebrate each reduction threshold" />
              <Card.Content>
                {plan.milestonesReached.length ? (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[8] }}>
                    {plan.milestonesReached.map((milestone) => (
                      <Chip key={milestone} icon="flag-checkered">
                        {milestone}% reached
                      </Chip>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.helperText}>Milestones will appear as your taper progresses.</Text>
                )}
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Title title="Schedule" subtitle="Scrollable plan with target doses and milestones" />
              <Card.Content style={{ gap: spacing[10] }}>
                {plan.schedule.map((step) => (
                  <View
                    key={`${step.step}-${step.dateISO}`}
                    style={{
                      borderWidth: 1,
                      borderColor: colors.neutral[200],
                      borderRadius: borderRadius.md,
                      padding: spacing[10],
                      gap: spacing[6],
                    }}
                  >
                    <View style={styles.row}>
                      <Text style={{ fontWeight: '600' }}>
                        Day {step.day} · {formatDateForDisplay(step.dateISO)}
                      </Text>
                      <Text>{step.dose.toFixed(2)}</Text>
                    </View>

                    {step.milestones.length ? (
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[6] }}>
                        {step.milestones.map((milestone) => (
                          <Chip key={`${step.step}-${milestone}`} compact icon="trophy-outline">
                            Milestone {milestone}%
                          </Chip>
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.helperText}>Maintain this target dose until next step-down.</Text>
                    )}
                  </View>
                ))}
              </Card.Content>
            </Card>
          </>
        ) : null}
      </ScrollView>

      <Snackbar visible={Boolean(statusMessage)} duration={3000} onDismiss={() => setStatusMessage(null)}>
        {statusMessage}
      </Snackbar>
    </SafeAreaView>
  );
};

export default TaperPage;
