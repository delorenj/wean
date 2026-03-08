import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import useDesignTokens from '../../hooks/useDesignTokens';
import { getCardSurfaceStyle } from '../../src/theme';
import { DailyDoseTotal, RollingAveragePoint } from '../../pages/analytics.helpers';

interface MonthlyTrendChartProps {
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

const toTickLabel = (dateISO: string): string => {
  const date = new Date(`${dateISO}T00:00:00.000Z`);
  const day = String(date.getUTCDate()).padStart(2, '0');
  return day;
};

export const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({
  dailyTotals,
  rollingAverage,
  unit,
  testID,
}) => {
  const tokens = useDesignTokens();
  const { colors, spacing, typography } = tokens;
  const cardSurfaceStyle = getCardSurfaceStyle(tokens);

  const {
    plannedPath,
    rollingPath,
    pointPositions,
    chartAreaHeight,
    chartAreaWidth,
    maxValue,
    xTickIndexes,
  } = useMemo(() => {
    const chartAreaWidth = CHART_WIDTH - CHART_PADDING_X * 2;
    const chartAreaHeight = CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM;
    const maxValue = Math.max(
      ...dailyTotals.map((point) => point.totalDose),
      ...rollingAverage.map((point) => point.rollingAverage),
      1
    );

    const toPoint = (index: number, value: number) => {
      const x = CHART_PADDING_X + (index / Math.max(dailyTotals.length - 1, 1)) * chartAreaWidth;
      const y = CHART_PADDING_TOP + chartAreaHeight - (value / maxValue) * chartAreaHeight;
      return { x, y };
    };

    const pointPositions = dailyTotals.map((point, index) => ({
      ...toPoint(index, point.totalDose),
      dateISO: point.dateISO,
      value: point.totalDose,
    }));

    const plannedPath = pointPositions
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ');

    const rollingPath = rollingAverage
      .map((point, index) => {
        const nextPoint = toPoint(index, point.rollingAverage);
        return `${index === 0 ? 'M' : 'L'} ${nextPoint.x} ${nextPoint.y}`;
      })
      .join(' ');

    const xTickIndexes = [0, 7, 14, 21, 29].filter((index) => index < dailyTotals.length);

    return {
      plannedPath,
      rollingPath,
      pointPositions,
      chartAreaHeight,
      chartAreaWidth,
      maxValue,
      xTickIndexes,
    };
  }, [dailyTotals, rollingAverage]);

  const firstPoint = pointPositions[0];
  const lastPoint = pointPositions[pointPositions.length - 1];

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
        30-day dose trend
      </Text>

      <Svg width="100%" height={CHART_HEIGHT} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}>
        {[0.25, 0.5, 0.75].map((ratio) => {
          const y = CHART_PADDING_TOP + chartAreaHeight * ratio;

          return (
            <Line
              key={`grid-${ratio}`}
              x1={CHART_PADDING_X}
              y1={y}
              x2={CHART_PADDING_X + chartAreaWidth}
              y2={y}
              stroke={colors.neutral[200]}
              strokeWidth={1}
            />
          );
        })}

        {plannedPath ? (
          <Path d={plannedPath} stroke={colors.primary[500]} strokeWidth={2.5} fill="none" />
        ) : null}

        {rollingPath ? (
          <Path d={rollingPath} stroke={colors.info} strokeWidth={2} strokeDasharray="4 3" fill="none" />
        ) : null}

        {firstPoint ? <Circle cx={firstPoint.x} cy={firstPoint.y} r={4} fill={colors.primary[600]} /> : null}
        {lastPoint ? <Circle cx={lastPoint.x} cy={lastPoint.y} r={5} fill={colors.warning} /> : null}

        {xTickIndexes.map((index) => {
          const point = pointPositions[index];

          if (!point) {
            return null;
          }

          return (
            <SvgText
              key={`tick-${point.dateISO}`}
              x={point.x}
              y={CHART_HEIGHT - 10}
              fontSize={11}
              fill={colors.onSurfaceVariant}
              textAnchor="middle"
            >
              {toTickLabel(point.dateISO)}
            </SvgText>
          );
        })}
      </Svg>

      <Text
        style={{
          color: colors.onSurfaceVariant,
          fontSize: typography.bodySmall.fontSize,
          lineHeight: typography.bodySmall.lineHeight,
          fontWeight: typography.bodySmall.fontWeight as '400',
        }}
      >
        Solid line = daily totals ({unit}). Dashed line = 7-day rolling average.
      </Text>

      <Text
        style={{
          color: colors.onSurfaceVariant,
          fontSize: typography.labelSmall.fontSize,
          lineHeight: typography.labelSmall.lineHeight,
          fontWeight: typography.labelSmall.fontWeight as '500',
        }}
      >
        30-day max: {maxValue.toFixed(2)} {unit}
      </Text>
    </View>
  );
};

export default MonthlyTrendChart;
