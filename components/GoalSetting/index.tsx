import React, { useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Button, Card, Chip, List, ProgressBar, Snackbar, Text, TextInput } from 'react-native-paper';
import useDesignTokens from '../../hooks/useDesignTokens';
import { getCardSurfaceStyle } from '../../src/theme';
import { Goal, GoalMilestone, SaveGoalInput } from '../../hooks/useGoals';
import { generateWeeklyMilestones } from '../../hooks/useGoals.helpers';

interface GoalSettingProps {
  goal: Goal | null;
  goalHistory: Goal[];
  currentDose: number;
  progressPercentage: number;
  celebrationMilestone: GoalMilestone | null;
  errorMessage?: string | null;
  onSave: (input: SaveGoalInput) => Promise<void>;
  onAbandon: () => Promise<void>;
  onComplete: () => Promise<void>;
  onDismissCelebration: () => void;
}

const formatDateForDisplay = (date: Date): string =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);

const formatDateFromISO = (dateISO?: string | null): string => {
  if (!dateISO) {
    return '—';
  }

  const parsedDate = new Date(dateISO);

  if (Number.isNaN(parsedDate.getTime())) {
    return '—';
  }

  return formatDateForDisplay(parsedDate);
};

const formatDateFromTimestamp = (timestamp?: { toDate?: () => Date } | null): string => {
  const date = timestamp?.toDate?.();

  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '—';
  }

  return formatDateForDisplay(date);
};

const toDateISO = (date: Date): string =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0))
    .toISOString()
    .split('T')[0];

export const GoalSetting: React.FC<GoalSettingProps> = ({
  goal,
  goalHistory,
  currentDose,
  progressPercentage,
  celebrationMilestone,
  errorMessage,
  onSave,
  onAbandon,
  onComplete,
  onDismissCelebration,
}) => {
  const tokens = useDesignTokens();
  const { colors, spacing, borderRadius, typography } = tokens;
  const cardSurfaceStyle = getCardSurfaceStyle(tokens);
  const [targetDoseInput, setTargetDoseInput] = useState('');
  const [targetDate, setTargetDate] = useState<Date>(() => {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    return defaultDate;
  });
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!goal) {
      setTargetDoseInput('');
      setNotes('');
      return;
    }

    setTargetDoseInput(goal.targetDose.toString());
    setNotes(goal.notes || '');

    if (goal.targetDate?.toDate) {
      setTargetDate(goal.targetDate.toDate());
    }
  }, [goal]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          ...cardSurfaceStyle,
        },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing[8],
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

  const targetDose = Number(targetDoseInput);

  const milestonePreview = useMemo(() => {
    if (!Number.isFinite(targetDose) || targetDose <= 0 || targetDose >= currentDose) {
      return [];
    }

    return generateWeeklyMilestones({
      startDose: currentDose,
      targetDose,
      startDate: new Date(),
      targetDate,
    });
  }, [currentDose, targetDate, targetDose]);

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (event.type === 'dismissed') {
      return;
    }

    if (selectedDate) {
      setTargetDate(selectedDate);
    }
  };

  const handleSaveGoal = async () => {
    setFormError(null);

    const parsedTargetDose = Number(targetDoseInput);

    if (!Number.isFinite(parsedTargetDose) || parsedTargetDose <= 0) {
      setFormError('Target dose must be greater than 0.');
      return;
    }

    if (parsedTargetDose >= currentDose) {
      setFormError('Target dose must be lower than your current dose.');
      return;
    }

    setIsSaving(true);

    try {
      await onSave({
        startDose: currentDose,
        targetDose: parsedTargetDose,
        targetDate,
        notes,
      });

      setStatusMessage(goal ? 'Goal updated successfully.' : 'Goal saved successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save goal';
      setFormError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAbandonGoal = async () => {
    setFormError(null);

    try {
      await onAbandon();
      setStatusMessage('Goal moved to history as abandoned.');
      setTargetDoseInput('');
      setNotes('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to abandon goal';
      setFormError(message);
    }
  };

  const handleCompleteGoal = async () => {
    setFormError(null);

    try {
      await onComplete();
      setStatusMessage('Goal marked complete 🎉');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to complete goal';
      setFormError(message);
    }
  };

  const todayISO = toDateISO(new Date());

  return (
    <View style={{ gap: spacing[16] }}>
      <Card style={styles.card}>
        <Card.Title title="Goal wizard" subtitle="1) Target  2) Date  3) Weekly checkpoints" />
        <Card.Content style={{ gap: spacing[12] }}>
          <TextInput
            mode="outlined"
            label="Target dose"
            keyboardType="decimal-pad"
            value={targetDoseInput}
            onChangeText={setTargetDoseInput}
          />

          <List.Item
            title="Target date"
            description={formatDateForDisplay(targetDate)}
            left={(props) => <List.Icon {...props} icon="calendar" />}
            onPress={() => setShowDatePicker(true)}
            style={{
              borderWidth: 1,
              borderColor: colors.neutral[200],
              borderRadius: borderRadius.md,
              backgroundColor: colors.surface,
            }}
          />

          {showDatePicker ? (
            <DateTimePicker
              value={targetDate}
              mode="date"
              minimumDate={new Date()}
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={handleDateChange}
            />
          ) : null}

          <TextInput
            mode="outlined"
            label="Motivation notes (optional)"
            multiline
            value={notes}
            onChangeText={setNotes}
          />

          {milestonePreview.length ? (
            <View style={{ gap: spacing[6] }}>
              <Text style={styles.helperText}>Milestone preview ({milestonePreview.length} checkpoints)</Text>
              {milestonePreview.slice(0, 4).map((milestone) => (
                <View key={milestone.id} style={styles.row}>
                  <Text style={styles.helperText}>{milestone.label}</Text>
                  <Text style={styles.helperText}>
                    {formatDateFromISO(milestone.targetDateISO)} · {milestone.targetDose.toFixed(2)}
                  </Text>
                </View>
              ))}
              {milestonePreview.length > 4 ? (
                <Text style={styles.helperText}>+{milestonePreview.length - 4} more checkpoints</Text>
              ) : null}
            </View>
          ) : null}

          <View style={[styles.row, { justifyContent: 'flex-end', gap: spacing[12] }]}>
            {goal ? (
              <Button mode="text" onPress={() => void handleAbandonGoal()}>
                Abandon Goal
              </Button>
            ) : null}
            <Button mode="contained" onPress={() => void handleSaveGoal()} loading={isSaving}>
              {goal ? 'Update Goal' : 'Save Goal'}
            </Button>
          </View>

          {formError || errorMessage ? (
            <Text style={{ color: colors.error }}>{formError || errorMessage}</Text>
          ) : null}
        </Card.Content>
      </Card>

      {goal ? (
        <Card style={styles.card}>
          <Card.Title title="Progress toward goal" subtitle="Live progress + milestone tracking" />
          <Card.Content style={{ gap: spacing[10] }}>
            <View style={styles.row}>
              <Text style={styles.helperText}>Current dose</Text>
              <Text>{currentDose.toFixed(2)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.helperText}>Target dose</Text>
              <Text>{goal.targetDose.toFixed(2)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.helperText}>Target date</Text>
              <Text>{formatDateFromTimestamp(goal.targetDate)}</Text>
            </View>

            <ProgressBar
              progress={Math.max(0, Math.min(1, progressPercentage / 100))}
              color={colors.primary[500]}
              style={{ height: 10, borderRadius: borderRadius.full }}
            />
            <Text style={styles.helperText}>{progressPercentage.toFixed(1)}% complete</Text>

            <View style={{ gap: spacing[8] }}>
              <Text style={{ fontWeight: '600' }}>Milestones</Text>
              {goal.milestones.map((milestone) => {
                const isOverdue = !milestone.achieved && milestone.targetDateISO <= todayISO;
                const icon = milestone.achieved
                  ? 'check-circle-outline'
                  : isOverdue
                  ? 'alert-circle-outline'
                  : 'clock-outline';

                return (
                  <View
                    key={milestone.id}
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
                      <Text style={{ fontWeight: '600' }}>{milestone.label}</Text>
                      <Chip compact icon={icon}>
                        {milestone.achieved ? 'Hit' : isOverdue ? 'Missed' : 'Upcoming'}
                      </Chip>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.helperText}>Checkpoint</Text>
                      <Text>
                        {formatDateFromISO(milestone.targetDateISO)} · {milestone.targetDose.toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.helperText}>Logged actual</Text>
                      <Text>{milestone.actualDose === null ? '—' : milestone.actualDose.toFixed(2)}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={[styles.row, { justifyContent: 'flex-end', gap: spacing[12] }]}>
              <Button mode="outlined" onPress={() => void handleCompleteGoal()}>
                Mark Complete
              </Button>
              <Button mode="text" onPress={() => void handleAbandonGoal()}>
                Abandon
              </Button>
            </View>
          </Card.Content>
        </Card>
      ) : null}

      {goalHistory.length ? (
        <Card style={styles.card}>
          <Card.Title title="Goal history" subtitle="Completed and abandoned goals" />
          <Card.Content style={{ gap: spacing[8] }}>
            {goalHistory.map((historicGoal) => (
              <View
                key={historicGoal.id}
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
                    {historicGoal.startDose.toFixed(2)} → {historicGoal.targetDose.toFixed(2)}
                  </Text>
                  <Chip compact icon={historicGoal.status === 'completed' ? 'trophy-outline' : 'close-circle-outline'}>
                    {historicGoal.status === 'completed' ? 'Completed' : 'Abandoned'}
                  </Chip>
                </View>

                <Text style={styles.helperText}>Target date: {formatDateFromTimestamp(historicGoal.targetDate)}</Text>
                <Text style={styles.helperText}>
                  Logged milestones hit: {historicGoal.milestones.filter((milestone) => milestone.achieved).length}/
                  {historicGoal.milestones.length}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      ) : null}

      <Snackbar
        visible={Boolean(celebrationMilestone || statusMessage)}
        duration={4000}
        onDismiss={() => {
          onDismissCelebration();
          setStatusMessage(null);
        }}
      >
        {celebrationMilestone
          ? `🎉 ${celebrationMilestone.label} hit! Target ${celebrationMilestone.targetDose.toFixed(2)} achieved.`
          : statusMessage}
      </Snackbar>
    </View>
  );
};

export default GoalSetting;
