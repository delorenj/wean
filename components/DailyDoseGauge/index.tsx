import React from 'react';
import { StyleSheet, Text, TextStyle, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import useDesignTokens from '../../hooks/useDesignTokens';

export interface DailyDoseGaugeProps {
  /** Current daily dose consumed. */
  currentDose: number;
  /** Daily target dose (tapering goal). */
  targetDose: number;
  /** Unit label shown in the UI. */
  unit?: string;
  /** Optional title shown above the gauge. */
  title?: string;
  /** Number of decimals for the dose display. */
  dosePrecision?: number;
  /** Optional explicit gauge size. Uses token-derived default when omitted. */
  size?: number;
  /** Optional explicit stroke width. Uses token-derived default when omitted. */
  strokeWidth?: number;
  testID?: string;
}

export interface DailyDoseGaugeMetrics {
  sanitizedCurrentDose: number;
  sanitizedTargetDose: number;
  progressRatio: number;
  clampedProgressRatio: number;
  percentage: number;
  isOverTarget: boolean;
  overTargetAmount: number;
  remainingAmount: number;
}

export const computeDailyDoseGaugeMetrics = (
  currentDose: number,
  targetDose: number
): DailyDoseGaugeMetrics => {
  const sanitizedCurrentDose = Number.isFinite(currentDose) ? Math.max(currentDose, 0) : 0;
  const sanitizedTargetDose = Number.isFinite(targetDose) ? Math.max(targetDose, 0) : 0;

  if (sanitizedTargetDose === 0) {
    const hasDose = sanitizedCurrentDose > 0;

    return {
      sanitizedCurrentDose,
      sanitizedTargetDose,
      progressRatio: hasDose ? 1 : 0,
      clampedProgressRatio: hasDose ? 1 : 0,
      percentage: hasDose ? 100 : 0,
      isOverTarget: hasDose,
      overTargetAmount: hasDose ? sanitizedCurrentDose : 0,
      remainingAmount: 0,
    };
  }

  const progressRatio = sanitizedCurrentDose / sanitizedTargetDose;
  const clampedProgressRatio = Math.min(progressRatio, 1);
  const percentage = Math.round(progressRatio * 100);
  const isOverTarget = sanitizedCurrentDose > sanitizedTargetDose;
  const overTargetAmount = isOverTarget ? sanitizedCurrentDose - sanitizedTargetDose : 0;
  const remainingAmount = isOverTarget ? 0 : sanitizedTargetDose - sanitizedCurrentDose;

  return {
    sanitizedCurrentDose,
    sanitizedTargetDose,
    progressRatio,
    clampedProgressRatio,
    percentage,
    isOverTarget,
    overTargetAmount,
    remainingAmount,
  };
};

const formatDose = (amount: number, precision: number): string => amount.toFixed(precision);

const toTextStyle = (
  typographyStyle: (typeof import('../../src/tokens').Typography)[keyof (typeof import('../../src/tokens').Typography)]
): TextStyle => typographyStyle as TextStyle;

export const DailyDoseGauge: React.FC<DailyDoseGaugeProps> = ({
  currentDose,
  targetDose,
  unit,
  title = 'Daily Dose',
  dosePrecision = 1,
  size,
  strokeWidth,
  testID,
}) => {
  const tokens = useDesignTokens();

  const resolvedCurrentDose = currentDose;
  const resolvedTargetDose = targetDose;
  const resolvedUnit = unit ?? 'g';

  const gaugeSize = size ?? tokens.spacing[56] * 3;
  const gaugeStrokeWidth = strokeWidth ?? tokens.spacing[16];
  const gaugeRadius = (gaugeSize - gaugeStrokeWidth) / 2;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;

  const metrics = computeDailyDoseGaugeMetrics(resolvedCurrentDose, resolvedTargetDose);

  const strokeDashoffset =
    gaugeCircumference - metrics.clampedProgressRatio * gaugeCircumference;

  const progressColor = metrics.isOverTarget
    ? tokens.colors.warning
    : tokens.colors.primary[400];

  const secondaryTextColor = metrics.isOverTarget
    ? tokens.colors.warning
    : tokens.colors.onSurfaceVariant;

  return (
    <View
      testID={testID}
      style={[
        styles.container,
        {
          padding: tokens.spacing[16],
          gap: tokens.spacing[16],
          backgroundColor: tokens.colors.surface,
          borderRadius: tokens.borderRadius.lg,
          borderColor: tokens.colors.neutral[200],
        },
      ]}
    >
      <Text
        style={[
          styles.title,
          {
            color: tokens.colors.onSurface,
            ...toTextStyle(tokens.typography.titleLarge),
          },
        ]}
      >
        {title}
      </Text>

      <View
        style={[
          styles.gaugeContainer,
          {
            width: gaugeSize,
            height: gaugeSize,
          },
        ]}
      >
        <Svg width={gaugeSize} height={gaugeSize}>
          <G rotation="-90" origin={`${gaugeSize / 2}, ${gaugeSize / 2}`}>
            <Circle
              cx={gaugeSize / 2}
              cy={gaugeSize / 2}
              r={gaugeRadius}
              stroke={tokens.colors.neutral[200]}
              strokeWidth={gaugeStrokeWidth}
              fill="none"
            />
            <Circle
              cx={gaugeSize / 2}
              cy={gaugeSize / 2}
              r={gaugeRadius}
              stroke={progressColor}
              strokeWidth={gaugeStrokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${gaugeCircumference}, ${gaugeCircumference}`}
              strokeDashoffset={strokeDashoffset}
            />
          </G>
        </Svg>

        <View style={styles.centerContent}>
          <Text
            style={[
              styles.percentage,
              {
                color: progressColor,
                ...toTextStyle(tokens.typography.headlineSmall),
              },
            ]}
          >
            {`${metrics.percentage}%`}
          </Text>
          <Text
            style={[
              styles.percentageLabel,
              {
                color: tokens.colors.onSurfaceVariant,
                ...toTextStyle(tokens.typography.labelMedium),
              },
            ]}
          >
            of target
          </Text>
        </View>
      </View>

      <Text
        style={[
          styles.doseSummary,
          {
            color: tokens.colors.onSurface,
            ...toTextStyle(tokens.typography.titleMedium),
          },
        ]}
      >
        {`${formatDose(metrics.sanitizedCurrentDose, dosePrecision)}${resolvedUnit} / ${formatDose(
          metrics.sanitizedTargetDose,
          dosePrecision
        )}${resolvedUnit}`}
      </Text>

      <View
        style={[
          styles.footerRow,
          {
            gap: tokens.spacing[16],
          },
        ]}
      >
        <View
          style={[
            styles.footerCard,
            {
              paddingVertical: tokens.spacing[8],
              paddingHorizontal: tokens.spacing[12],
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.surfaceVariant,
            },
          ]}
        >
          <Text
            style={[
              styles.footerLabel,
              {
                color: tokens.colors.onSurfaceVariant,
                ...toTextStyle(tokens.typography.labelMedium),
              },
            ]}
          >
            Taken
          </Text>
          <Text
            style={[
              styles.footerValue,
              {
                color: tokens.colors.onSurface,
                ...toTextStyle(tokens.typography.titleSmall),
              },
            ]}
          >
            {`${formatDose(metrics.sanitizedCurrentDose, dosePrecision)}${resolvedUnit}`}
          </Text>
        </View>

        <View
          style={[
            styles.footerCard,
            {
              paddingVertical: tokens.spacing[8],
              paddingHorizontal: tokens.spacing[12],
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.surfaceVariant,
              borderColor: metrics.isOverTarget
                ? tokens.colors.warning
                : tokens.colors.neutral[200],
              borderWidth: metrics.isOverTarget ? tokens.spacing[2] : tokens.spacing[0],
            },
          ]}
        >
          <Text
            style={[
              styles.footerLabel,
              {
                color: secondaryTextColor,
                ...toTextStyle(tokens.typography.labelMedium),
              },
            ]}
          >
            {metrics.isOverTarget ? 'Over target' : 'Remaining'}
          </Text>
          <Text
            style={[
              styles.footerValue,
              {
                color: secondaryTextColor,
                ...toTextStyle(tokens.typography.titleSmall),
              },
            ]}
          >
            {`${formatDose(
              metrics.isOverTarget ? metrics.overTargetAmount : metrics.remainingAmount,
              dosePrecision
            )}${resolvedUnit}`}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
  },
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentage: {
    textAlign: 'center',
  },
  percentageLabel: {
    textAlign: 'center',
  },
  doseSummary: {
    textAlign: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    width: '100%',
  },
  footerCard: {
    flex: 1,
    alignItems: 'center',
  },
  footerLabel: {
    textAlign: 'center',
  },
  footerValue: {
    textAlign: 'center',
  },
});

export default DailyDoseGauge;
export { formatDose };
