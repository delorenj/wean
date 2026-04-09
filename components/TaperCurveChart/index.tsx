import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Circle, Path } from 'react-native-svg';
import useDesignTokens from '../../hooks/useDesignTokens';
import { getCardSurfaceStyle } from '../../src/theme';
import { SmartTaperPlan } from '../../pages/plan.helpers';

interface TaperCurveChartProps {
  plan: SmartTaperPlan;
  activeDayIndex: number;
  actualDose: number;
  testID?: string;
}

const CHART_WIDTH = 320;
const CHART_HEIGHT = 180;
const CHART_PADDING = 20;

const toPoint = (
  index: number,
  value: number,
  maxDose: number,
  totalPoints: number
): { x: number; y: number } => {
  const chartWidth = CHART_WIDTH - CHART_PADDING * 2;
  const chartHeight = CHART_HEIGHT - CHART_PADDING * 2;
  const x = CHART_PADDING + (index / Math.max(totalPoints - 1, 1)) * chartWidth;

  const normalized = maxDose > 0 ? value / maxDose : 0;
  const y = CHART_HEIGHT - CHART_PADDING - normalized * chartHeight;

  return { x, y };
};

export const TaperCurveChart: React.FC<TaperCurveChartProps> = ({
  plan,
  activeDayIndex,
  actualDose,
  testID,
}) => {
  const tokens = useDesignTokens();
  const { colors, spacing, typography } = tokens;
  const cardSurfaceStyle = getCardSurfaceStyle(tokens);

  const maxDose = Math.max(plan.currentDose, plan.targetDose, actualDose, 1);

  const { pathData, activePoint } = useMemo(() => {
    const points = plan.schedule.map((day, index) =>
      toPoint(index, day.targetDose, maxDose, plan.schedule.length)
    );

    const path = points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ');

    return {
      pathData: path,
      activePoint: points[Math.min(Math.max(activeDayIndex, 0), points.length - 1)],
    };
  }, [plan.schedule, maxDose, activeDayIndex]);

  const actualPoint = toPoint(activeDayIndex, actualDose, maxDose, plan.schedule.length);

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
        Planned taper curve
      </Text>

      <Svg width="100%" height={CHART_HEIGHT} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}>
        <Path d={pathData} stroke={colors.primary[400]} strokeWidth={3} fill="none" />

        {activePoint ? (
          <Circle
            cx={activePoint.x}
            cy={activePoint.y}
            r={6}
            fill={colors.primary[600]}
          />
        ) : null}

        <Circle cx={actualPoint.x} cy={actualPoint.y} r={5} fill={colors.warning} />
      </Svg>

      <Text
        style={{
          color: colors.onSurfaceVariant,
          fontSize: typography.bodySmall.fontSize,
          lineHeight: typography.bodySmall.lineHeight,
          fontWeight: typography.bodySmall.fontWeight as '400',
        }}
      >
        Blue dot = planned target, amber dot = actual today
      </Text>
    </View>
  );
};

export default TaperCurveChart;
