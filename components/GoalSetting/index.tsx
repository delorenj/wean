import React, { useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Button, Card, Chip, List, ProgressBar, Snackbar, Text, TextInput } from 'react-native-paper';
import useDesignTokens from '../../hooks/useDesignTokens';
import { getCardSurfaceStyle } from '../../src/theme';
import { Goal, SaveGoalInput } from '../../hooks/useGoals';
import { GoalMilestoneState } from '../../hooks/useGoals.helpers';

interface GoalSettingProps {
  goal: Goal | null;
  currentDose: number;
  progressPercentage: number;
  milestoneStates: GoalMilestoneState[];
  celebrationMilestone: number | null;
  errorMessage?: string | null;
  onSave: (input: SaveGoalInput) => Promise<void>;
  onClear: () => Promise<void>;
  onDismissCelebration: () => void;
}

const formatDateForDisplay = (date: Date): string =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);

export const GoalSetting: React.FC<GoalSettingProps> = ({
  goal,
  currentDose,
  progressPercentage,
  milestoneStates,
  celebrationMilestone,
  errorMessage,
  onSave,
  onClear,
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
        },
        helperText: {
          color: colors.onSurfaceVariant,
          fontSize: typography.bodySmall.fontSize,
          lineHeight: typography.bodySmall.lineHeight,
          fontWeight: typography.bodySmall.fontWeight as '400',
        },
      }),
    [cardSurfaceStyle, colors, typography]
  );

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

    if (!Number.isFinite(parsedTargetDose) || parsedTargetDose < 0) {
      setFormError('Target dose must be a non-negative number.');
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

  const handleClearGoal = async () => {
    setFormError(null);

    try {
      await onClear();
      setStatusMessage('Goal cleared. Set a new milestone anytime.');
      setTargetDoseInput('');
      setNotes('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to clear goal';
      setFormError(message);
    }
  };

  return (
    <View style={{ gap: spacing[16] }}>
      <Card style={styles.card}>
        <Card.Title title="Goal setup" subtitle="Set your target dose, target date, and motivation" />
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

          <View style={[styles.row, { justifyContent: 'flex-end', gap: spacing[12] }]}>
            {goal ? (
              <Button mode="text" onPress={() => void handleClearGoal()}>
                Clear Goal
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
          <Card.Title title="Progress toward goal" subtitle="Current vs target dose" />
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
              <Text style={styles.helperText}>Started at</Text>
              <Text>{goal.startDose.toFixed(2)}</Text>
            </View>

            <ProgressBar
              progress={Math.max(0, Math.min(1, progressPercentage / 100))}
              color={colors.primary[500]}
              style={{ height: 10, borderRadius: borderRadius.full }}
            />
            <Text style={styles.helperText}>{progressPercentage.toFixed(1)}% complete</Text>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[8] }}>
              {milestoneStates.map((milestone) => (
                <Chip
                  key={milestone.threshold}
                  selected={milestone.isReached}
                  icon={milestone.isReached ? 'flag-checkered' : 'flag-outline'}
                >
                  {milestone.threshold}%
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>
      ) : null}

      <Snackbar
        visible={Boolean(celebrationMilestone || statusMessage)}
        duration={3500}
        onDismiss={() => {
          onDismissCelebration();
          setStatusMessage(null);
        }}
      >
        {celebrationMilestone
          ? `🎉 Milestone reached: ${celebrationMilestone}% complete! Keep going!`
          : statusMessage}
      </Snackbar>
    </View>
  );
};

export default GoalSetting;
