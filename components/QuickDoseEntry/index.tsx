import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  Vibration,
  View,
} from 'react-native';
import useDesignTokens from '../../hooks/useDesignTokens';
import {
  adjustDoseAmount,
  adjustTimestampByMinutes,
  clampDoseAmount,
  convertDoseAmount,
  DoseUnit,
  formatDoseInput,
  formatEntryTimestampLabel,
  parseDoseAmount,
  roundToDosePrecision,
  validateDoseEntry,
} from './helpers';

export interface QuickDoseEntryPayload {
  amount: number;
  unit: DoseUnit;
  timestamp: Date;
  notes?: string;
  method?: string;
}

export interface QuickDoseEntryProps {
  onSubmit: (payload: QuickDoseEntryPayload) => void | Promise<void>;
  mode?: 'add' | 'edit';
  initialAmount?: number;
  initialUnit?: DoseUnit;
  initialTimestamp?: Date;
  initialNotes?: string;
  initialMethod?: string;
  submitLabel?: string;
  cancelLabel?: string;
  disabled?: boolean;
  onCancel?: () => void;
  testID?: string;
}

const TIMESTAMP_ADJUSTMENT_MINUTES = 15;
const SUCCESS_VISIBLE_MS = 1200;

const toTextStyle = (
  typographyStyle: (typeof import('../../src/tokens').Typography)[keyof (typeof import('../../src/tokens').Typography)]
): TextStyle => typographyStyle as TextStyle;

const sanitizeInitialTimestamp = (value?: Date): Date => {
  if (!value || Number.isNaN(value.getTime())) {
    return new Date();
  }

  return new Date(value);
};

export const QuickDoseEntry: React.FC<QuickDoseEntryProps> = ({
  onSubmit,
  mode = 'add',
  initialAmount = 0,
  initialUnit = 'g',
  initialTimestamp,
  initialNotes = '',
  initialMethod = '',
  submitLabel,
  cancelLabel = 'Cancel',
  disabled = false,
  onCancel,
  testID,
}) => {
  const tokens = useDesignTokens();

  const [unit, setUnit] = useState<DoseUnit>(initialUnit);
  const [amountInput, setAmountInput] = useState<string>(() =>
    formatDoseInput(clampDoseAmount(initialAmount, initialUnit), initialUnit)
  );
  const [timestamp, setTimestamp] = useState<Date>(() =>
    sanitizeInitialTimestamp(initialTimestamp)
  );
  const [notesInput, setNotesInput] = useState<string>(initialNotes);
  const [methodInput, setMethodInput] = useState<string>(initialMethod);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [didSubmit, setDidSubmit] = useState(false);

  const resolvedSubmitLabel = submitLabel || (mode === 'edit' ? 'Save Changes' : 'Log Dose');
  const resolvedSuccessLabel = mode === 'edit' ? 'Saved ✓' : 'Logged ✓';
  const resolvedSubmittingLabel = mode === 'edit' ? 'Saving...' : 'Logging...';
  const headingLabel = mode === 'edit' ? 'Edit Dose' : 'Quick Dose Entry';

  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submitScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setUnit(initialUnit);
    setAmountInput(formatDoseInput(clampDoseAmount(initialAmount, initialUnit), initialUnit));
    setTimestamp(sanitizeInitialTimestamp(initialTimestamp));
    setNotesInput(initialNotes);
    setMethodInput(initialMethod);
    setErrorMessage(undefined);
    setDidSubmit(false);
  }, [initialAmount, initialUnit, initialTimestamp, initialNotes, initialMethod]);

  const timestampLabel = useMemo(() => formatEntryTimestampLabel(timestamp), [timestamp]);

  const setAmountFromValue = (value: number, nextUnit: DoseUnit) => {
    setAmountInput(formatDoseInput(value, nextUnit));
  };

  const handleAmountChange = (value: string) => {
    setErrorMessage(undefined);

    const sanitized = value.replace(/[^0-9.,]/g, '');
    setAmountInput(sanitized);
  };

  const handleAdjustDose = (direction: 'increment' | 'decrement') => {
    setErrorMessage(undefined);

    const parsed = parseDoseAmount(amountInput) ?? 0;
    const nextAmount = adjustDoseAmount(parsed, direction, unit);

    setAmountFromValue(nextAmount, unit);
  };

  const handleSelectUnit = (nextUnit: DoseUnit) => {
    if (nextUnit === unit) {
      return;
    }

    setErrorMessage(undefined);

    const parsed = parseDoseAmount(amountInput) ?? 0;
    const converted = convertDoseAmount(parsed, unit, nextUnit);

    setUnit(nextUnit);
    setAmountFromValue(converted, nextUnit);
  };

  const handleAdjustTimestamp = (minutesDelta: number) => {
    setErrorMessage(undefined);
    setTimestamp((current) => adjustTimestampByMinutes(current, minutesDelta));
  };

  const handleResetTimestamp = () => {
    setErrorMessage(undefined);
    setTimestamp(new Date());
  };

  const animateSubmitConfirmation = () => {
    Animated.sequence([
      Animated.spring(submitScale, {
        toValue: 0.97,
        useNativeDriver: true,
        speed: 20,
        bounciness: 6,
      }),
      Animated.spring(submitScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 18,
        bounciness: 10,
      }),
    ]).start();
  };

  const showSuccessState = () => {
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }

    setDidSubmit(true);
    successTimeoutRef.current = setTimeout(() => {
      setDidSubmit(false);
      successTimeoutRef.current = null;
    }, SUCCESS_VISIBLE_MS);
  };

  const handleSubmit = async () => {
    if (disabled || isSubmitting) {
      return;
    }

    const parsedAmount = parseDoseAmount(amountInput);
    const numericAmount = parsedAmount ?? Number.NaN;

    const validation = validateDoseEntry({
      amount: numericAmount,
      unit,
      timestamp,
    });

    if (!validation.isValid) {
      setErrorMessage(validation.amountError ?? validation.timestampError);
      return;
    }

    setErrorMessage(undefined);
    setIsSubmitting(true);

    try {
      animateSubmitConfirmation();
      Vibration.vibrate(tokens.animation.fast);

      await Promise.resolve(
        onSubmit({
          amount: roundToDosePrecision(numericAmount, unit),
          unit,
          timestamp: new Date(timestamp),
          notes: notesInput.trim() || undefined,
          method: methodInput.trim() || undefined,
        })
      );

      showSuccessState();
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitBackgroundColor = disabled || isSubmitting
    ? tokens.componentStates.button.disabled.backgroundColor
    : tokens.componentStates.button.enabled.backgroundColor;

  const submitTextColor = disabled || isSubmitting
    ? tokens.componentStates.button.disabled.textColor
    : tokens.componentStates.button.enabled.textColor;

  return (
    <View
      testID={testID}
      style={[
        styles.container,
        {
          padding: tokens.spacing[16],
          gap: tokens.spacing[16],
          borderRadius: tokens.borderRadius.lg,
          borderColor: tokens.colors.neutral[200],
          borderWidth: tokens.spacing[2],
          backgroundColor: tokens.colors.surface,
        },
      ]}
    >
      <Text
        style={[
          styles.heading,
          {
            color: tokens.colors.onSurface,
            ...toTextStyle(tokens.typography.titleLarge),
          },
        ]}
      >
        {headingLabel}
      </Text>

      <View style={[styles.section, { gap: tokens.spacing[8] }]}> 
        <Text
          style={[
            styles.label,
            {
              color: tokens.colors.onSurfaceVariant,
              ...toTextStyle(tokens.typography.labelLarge),
            },
          ]}
        >
          Dose Amount
        </Text>

        <View style={[styles.amountRow, { gap: tokens.spacing[8] }]}> 
          <Pressable
            accessibilityLabel="Decrease dose amount"
            onPress={() => handleAdjustDose('decrement')}
            style={[
              styles.stepButton,
              {
                width: tokens.spacing[56],
                height: tokens.spacing[56],
                borderRadius: tokens.borderRadius.md,
                borderColor: tokens.colors.neutral[300],
                borderWidth: tokens.spacing[2],
                backgroundColor: tokens.colors.surfaceVariant,
              },
            ]}
          >
            <Text
              style={{
                color: tokens.colors.onSurface,
                ...toTextStyle(tokens.typography.headlineSmall),
              }}
            >
              −
            </Text>
          </Pressable>

          <TextInput
            keyboardType="decimal-pad"
            value={amountInput}
            onChangeText={handleAmountChange}
            placeholder={unit === 'g' ? '0.0' : '0'}
            placeholderTextColor={tokens.colors.onSurfaceVariant}
            style={[
              styles.amountInput,
              {
                minHeight: tokens.spacing[56],
                borderRadius: tokens.borderRadius.md,
                borderColor: tokens.colors.neutral[300],
                borderWidth: tokens.spacing[2],
                paddingHorizontal: tokens.spacing[12],
                color: tokens.colors.onSurface,
                backgroundColor: tokens.colors.surface,
                ...toTextStyle(tokens.typography.headlineSmall),
              },
            ]}
          />

          <Pressable
            accessibilityLabel="Increase dose amount"
            onPress={() => handleAdjustDose('increment')}
            style={[
              styles.stepButton,
              {
                width: tokens.spacing[56],
                height: tokens.spacing[56],
                borderRadius: tokens.borderRadius.md,
                borderColor: tokens.colors.neutral[300],
                borderWidth: tokens.spacing[2],
                backgroundColor: tokens.colors.surfaceVariant,
              },
            ]}
          >
            <Text
              style={{
                color: tokens.colors.onSurface,
                ...toTextStyle(tokens.typography.headlineSmall),
              }}
            >
              +
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={[styles.section, { gap: tokens.spacing[8] }]}> 
        <Text
          style={[
            styles.label,
            {
              color: tokens.colors.onSurfaceVariant,
              ...toTextStyle(tokens.typography.labelLarge),
            },
          ]}
        >
          Unit
        </Text>

        <View style={[styles.unitRow, { gap: tokens.spacing[8] }]}> 
          {(['g', 'mg'] as const).map((availableUnit) => {
            const isSelected = unit === availableUnit;

            return (
              <Pressable
                key={availableUnit}
                accessibilityRole="button"
                accessibilityLabel={`Set unit to ${availableUnit}`}
                onPress={() => handleSelectUnit(availableUnit)}
                style={[
                  styles.unitButton,
                  {
                    minHeight: tokens.spacing[56],
                    borderRadius: tokens.borderRadius.md,
                    borderColor: isSelected
                      ? tokens.componentStates.card.active.borderColor
                      : tokens.colors.neutral[300],
                    borderWidth: tokens.spacing[2],
                    backgroundColor: isSelected
                      ? tokens.componentStates.card.active.backgroundColor
                      : tokens.colors.surfaceVariant,
                  },
                ]}
              >
                <Text
                  style={{
                    color: isSelected
                      ? tokens.colors.primary[700]
                      : tokens.colors.onSurface,
                    ...toTextStyle(tokens.typography.titleMedium),
                  }}
                >
                  {availableUnit}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={[styles.section, { gap: tokens.spacing[8] }]}> 
        <Text
          style={[
            styles.label,
            {
              color: tokens.colors.onSurfaceVariant,
              ...toTextStyle(tokens.typography.labelLarge),
            },
          ]}
        >
          Timestamp
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reset timestamp to now"
          onPress={handleResetTimestamp}
          style={[
            styles.timestampButton,
            {
              minHeight: tokens.spacing[56],
              borderRadius: tokens.borderRadius.md,
              borderColor: tokens.colors.neutral[300],
              borderWidth: tokens.spacing[2],
              backgroundColor: tokens.colors.surfaceVariant,
              paddingHorizontal: tokens.spacing[12],
            },
          ]}
        >
          <Text
            style={{
              color: tokens.colors.onSurface,
              ...toTextStyle(tokens.typography.titleMedium),
            }}
          >
            {timestampLabel}
          </Text>
        </Pressable>

        <View style={[styles.timestampAdjustRow, { gap: tokens.spacing[8] }]}> 
          <Pressable
            accessibilityLabel="Move timestamp earlier"
            onPress={() => handleAdjustTimestamp(-TIMESTAMP_ADJUSTMENT_MINUTES)}
            style={[
              styles.timestampAdjustButton,
              {
                minHeight: tokens.spacing[48],
                borderRadius: tokens.borderRadius.md,
                borderColor: tokens.colors.neutral[300],
                borderWidth: tokens.spacing[2],
                backgroundColor: tokens.colors.surfaceVariant,
              },
            ]}
          >
            <Text
              style={{
                color: tokens.colors.onSurface,
                ...toTextStyle(tokens.typography.labelLarge),
              }}
            >
              -{TIMESTAMP_ADJUSTMENT_MINUTES}m
            </Text>
          </Pressable>

          <Pressable
            accessibilityLabel="Set timestamp to now"
            onPress={handleResetTimestamp}
            style={[
              styles.timestampAdjustButton,
              {
                minHeight: tokens.spacing[48],
                borderRadius: tokens.borderRadius.md,
                borderColor: tokens.colors.primary[200],
                borderWidth: tokens.spacing[2],
                backgroundColor: tokens.colors.primary[50],
              },
            ]}
          >
            <Text
              style={{
                color: tokens.colors.primary[700],
                ...toTextStyle(tokens.typography.labelLarge),
              }}
            >
              Now
            </Text>
          </Pressable>

          <Pressable
            accessibilityLabel="Move timestamp later"
            onPress={() => handleAdjustTimestamp(TIMESTAMP_ADJUSTMENT_MINUTES)}
            style={[
              styles.timestampAdjustButton,
              {
                minHeight: tokens.spacing[48],
                borderRadius: tokens.borderRadius.md,
                borderColor: tokens.colors.neutral[300],
                borderWidth: tokens.spacing[2],
                backgroundColor: tokens.colors.surfaceVariant,
              },
            ]}
          >
            <Text
              style={{
                color: tokens.colors.onSurface,
                ...toTextStyle(tokens.typography.labelLarge),
              }}
            >
              +{TIMESTAMP_ADJUSTMENT_MINUTES}m
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={[styles.section, { gap: tokens.spacing[8] }]}>
        <Text
          style={[
            styles.label,
            {
              color: tokens.colors.onSurfaceVariant,
              ...toTextStyle(tokens.typography.labelLarge),
            },
          ]}
        >
          Method
        </Text>

        <TextInput
          value={methodInput}
          onChangeText={(value) => {
            setErrorMessage(undefined);
            setMethodInput(value);
          }}
          placeholder="Capsule, tea, toss & wash…"
          placeholderTextColor={tokens.colors.onSurfaceVariant}
          style={[
            styles.textInput,
            {
              minHeight: tokens.spacing[56],
              borderRadius: tokens.borderRadius.md,
              borderColor: tokens.colors.neutral[300],
              borderWidth: tokens.spacing[2],
              paddingHorizontal: tokens.spacing[12],
              color: tokens.colors.onSurface,
              backgroundColor: tokens.colors.surface,
              ...toTextStyle(tokens.typography.bodyMedium),
            },
          ]}
        />
      </View>

      <View style={[styles.section, { gap: tokens.spacing[8] }]}>
        <Text
          style={[
            styles.label,
            {
              color: tokens.colors.onSurfaceVariant,
              ...toTextStyle(tokens.typography.labelLarge),
            },
          ]}
        >
          Notes
        </Text>

        <TextInput
          value={notesInput}
          onChangeText={(value) => {
            setErrorMessage(undefined);
            setNotesInput(value);
          }}
          placeholder="Optional details"
          placeholderTextColor={tokens.colors.onSurfaceVariant}
          multiline
          textAlignVertical="top"
          style={[
            styles.textInput,
            {
              minHeight: tokens.spacing[64],
              borderRadius: tokens.borderRadius.md,
              borderColor: tokens.colors.neutral[300],
              borderWidth: tokens.spacing[2],
              paddingHorizontal: tokens.spacing[12],
              paddingVertical: tokens.spacing[12],
              color: tokens.colors.onSurface,
              backgroundColor: tokens.colors.surface,
              ...toTextStyle(tokens.typography.bodyMedium),
            },
          ]}
        />
      </View>

      {errorMessage ? (
        <Text
          style={{
            color: tokens.colors.error,
            ...toTextStyle(tokens.typography.bodySmall),
          }}
        >
          {errorMessage}
        </Text>
      ) : null}

      <View style={[styles.actionsRow, { gap: tokens.spacing[8] }]}>
        {onCancel ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={cancelLabel}
            disabled={disabled || isSubmitting}
            onPress={onCancel}
            style={[
              styles.cancelButton,
              {
                minHeight: tokens.spacing[56],
                borderRadius: tokens.borderRadius.lg,
                borderColor: tokens.colors.neutral[300],
                borderWidth: tokens.spacing[2],
                backgroundColor: tokens.colors.surfaceVariant,
              },
            ]}
          >
            <Text
              style={{
                color: tokens.colors.onSurface,
                ...toTextStyle(tokens.typography.titleMedium),
              }}
            >
              {cancelLabel}
            </Text>
          </Pressable>
        ) : null}

        <Animated.View style={[styles.submitWrapper, { transform: [{ scale: submitScale }] }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={resolvedSubmitLabel}
            disabled={disabled || isSubmitting}
            onPress={handleSubmit}
            style={[
              styles.submitButton,
              {
                minHeight: tokens.spacing[56],
                borderRadius: tokens.borderRadius.lg,
                backgroundColor: submitBackgroundColor,
                ...tokens.shadows.z2,
              },
            ]}
          >
            <Text
              style={{
                color: submitTextColor,
                ...toTextStyle(tokens.typography.titleMedium),
              }}
            >
              {didSubmit ? resolvedSuccessLabel : isSubmitting ? resolvedSubmittingLabel : resolvedSubmitLabel}
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  heading: {
    textAlign: 'center',
  },
  section: {
    width: '100%',
  },
  label: {
    textTransform: 'uppercase',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountInput: {
    flex: 1,
    textAlign: 'center',
  },
  stepButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitRow: {
    flexDirection: 'row',
  },
  unitButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timestampButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timestampAdjustRow: {
    flexDirection: 'row',
  },
  timestampAdjustButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    width: '100%',
  },
  actionsRow: {
    width: '100%',
    flexDirection: 'row',
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitWrapper: {
    flex: 1,
  },
  submitButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default QuickDoseEntry;
