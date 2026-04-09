import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import useDesignTokens from '../../hooks/useDesignTokens';
import { getCardSurfaceStyle } from '../../src/theme';
import { DailyDoseTotal, RollingAveragePoint } from '../../pages/analytics.helpers';

interface WeeklyTrendChartProps {
  dailyTotals: DailyDoseTotal[];
  rollingAverage: RollingAveragePoint[];
  unit: string;
  testID?: string;
}

const CHART_WIDTH = 320;
const CHART_HEIGHT = 190;
const CHART_PADDING_X = 20;
const CHART_PADDING_TOP = 20;
const CHART_PADDING_BOTTOM = 34;

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const toDayLabel = (dateISO: string): string => {
  const date = new Date(`${dateISO}T00:00:00.000Z`);
  return DAY_LABELS[date.getUTCDay()] || '';
};

export const WeeklyTrendChart: React.FC<WeeklyTrendChartProps> = ({
  dailyTotals,
  rollingAverage,
  unit,
  testID,
}) => {
  const tokens = useDesignTokens();
  const { colors, spacing, typography } = tokens;
  const cardSurfaceStyle = getCardSurfaceStyle(tokens);

  const {
    barSlots,
    rollingPath,
    chartAreaHeight,
    chartAreaWidth,
    maxValue,
  } = useMemo(() => {
    const chartAreaWidth = CHART_WIDTH - CHART_PADDING_X * 2;
    const chartAreaHeight = CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM;

    const maxValue = Math.max(
      ...dailyTotals.map((point) => point.totalDose),
      ...rollingAverage.map((point) => point.rollingAverage),
      1
    );

    const slotWidth = chartAreaWidth / Math.max(dailyTotals.length, 1);
    const barWidth = Math.min(22, slotWidth * 0.7);

    const barSlots = dailyTotals.map((point, index) => {
      const normalized = point.totalDose / maxValue;
      const barHeight = normalized * chartAreaHeight;
      const x = CHART_PADDING_X + index * slotWidth + (slotWidth - barWidth) / 2;
      const y = CHART_PADDING_TOP + (chartAreaHeight - barHeight);

      return {
        dateISO: point.dateISO,
        x,
        y,
        width: barWidth,
        height: barHeight,
      };
    });

    const rollingPath = rollingAverage
      .map((point, index) => {
        const normalized = point.rollingAverage / maxValue;
        const y = CHART_PADDING_TOP + chartAreaHeight - normalized * chartAreaHeight;
        const x = CHART_PADDING_X + index * slotWidth + slotWidth / 2;

        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');

    return {
      barSlots,
      rollingPath,
      chartAreaHeight,
      chartAreaWidth,
      maxValue,
    };
  }, [dailyTotals, rollingAverage]);

  return (
    <View
      testID={testID}
      style={{
        ...cardSurfaceStyle,
        padding: spacing[16],
        gap: spacing[12],
      }}
    >
      <Text
        style={{
          color: colors.onSurface,
          fontSize: typography.titleMedium.fontSize,
          lineHeight: typography.titleMedium.lineHeight,
          fontWeight: typography.titleMedium.fontWeight as '500',
        }}
      >
        Daily totals + 7-day rolling average
      </Text>

      <Svg width="100%" height={CHART_HEIGHT} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}>
        <Line
          x1={CHART_PADDING_X}
          y1={CHART_PADDING_TOP + chartAreaHeight}
          x2={CHART_PADDING_X + chartAreaWidth}
          y2={CHART_PADDING_TOP + chartAreaHeight}
          stroke={colors.neutral[300]}
          strokeWidth={1}
        />

        {barSlots.map((slot) => (
          <Rect
            key={slot.dateISO}
            x={slot.x}
            y={slot.y}
            width={slot.width}
            height={Math.max(slot.height, 2)}
            rx={3}
            fill={colors.primary[300]}
            opacity={0.85}
          />
        ))}

        {rollingPath ? (
          <Path d={rollingPath} stroke={colors.warning} strokeWidth={2.5} fill="none" />
        ) : null}

        {barSlots.map((slot) => (
          <SvgText
            key={`label-${slot.dateISO}`}
            x={slot.x + slot.width / 2}
            y={CHART_HEIGHT - 10}
            fontSize={11}
            fill={colors.onSurfaceVariant}
            textAnchor="middle"
          >
            {toDayLabel(slot.dateISO)}
          </SvgText>
        ))}
      </Svg>

      <Text
        style={{
          color: colors.onSurfaceVariant,
          fontSize: typography.bodySmall.fontSize,
          lineHeight: typography.bodySmall.lineHeight,
          fontWeight: typography.bodySmall.fontWeight as '400',
        }}
      >
        Bars show logged daily totals ({unit}). Orange line tracks the rolling average.
      </Text>

      <Text
        style={{
          color: colors.onSurfaceVariant,
          fontSize: typography.labelSmall.fontSize,
          lineHeight: typography.labelSmall.lineHeight,
          fontWeight: typography.labelSmall.fontWeight as '500',
        }}
      >
        Peak in view: {maxValue.toFixed(2)} {unit}
      </Text>
    </View>
  );
};

export default WeeklyTrendChart;
