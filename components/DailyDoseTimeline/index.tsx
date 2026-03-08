import React, { useMemo } from 'react';
import {StyleSheet, FlatList, View} from 'react-native';
import { Title, Paragraph } from 'react-native-paper';
import {DailyDoseGauge} from '../DailyDoseGauge';
import {Index as RollingCalendarWeek, RollingCalendarWeekEntry} from '../../components/RollingCalendarWeek';
import { useDoses } from '../../hooks/useDoses';
import { useTaperSettings } from '../../hooks/useTaperSettings';
import useDesignTokens from '../../hooks/useDesignTokens';

// Custom TimelineItem component
const TimelineItem = ({ title, description, time, tokens }) => (
  <View style={styles.timelineItemContainer}>
    {/* Vertical colored line */}
    <View style={[styles.timelineLine, { backgroundColor: tokens.colors.primary[300] }]} />
    {/* Card content */}
    <View style={styles.card}>
      <View>
        <Title>{title}</Title>
        <Paragraph>{description}</Paragraph>
        <Paragraph style={[styles.timeText, { color: tokens.colors.onSurfaceVariant }]}>{time}</Paragraph>
      </View>
    </View>
  </View>

);

interface ListHeaderProps {
  currentDose: number;
  targetDose: number;
  unit: string;
  calendarEntries: RollingCalendarWeekEntry[];
}

const ListHeader: React.FC<ListHeaderProps> = ({ currentDose, targetDose, unit, calendarEntries }) => (
  <View>
    <RollingCalendarWeek
      entries={calendarEntries}
      defaultTargetDose={targetDose}
      unit={unit}
    />
    <DailyDoseGauge currentDose={currentDose} targetDose={targetDose} unit={unit} />
  </View>
);

// Vertical timeline list component
const TimelineList = () => {
  const tokens = useDesignTokens();
  const { settings } = useTaperSettings();
  // Define the data for the timeline
  const { doses, totalDoses, commonUnit } = useDoses();

  const calendarEntries = useMemo<RollingCalendarWeekEntry[]>(() => {
    return doses.map((dose) => ({
      date: dose.date?.toDate ? dose.date.toDate() : new Date(),
      doseTaken: dose.amount,
      targetDose: settings.targetDose,
      unit: dose.doseUnit || settings.unit || commonUnit,
    }));
  }, [doses, settings.targetDose, settings.unit, commonUnit]);

  return (
    // Wrap the FlatList with a ScrollView
    <FlatList
      data={doses}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => (
        <TimelineItem title={item.substance} description={item.amount} time={item.doseUnit} tokens={tokens} />
      )}
      ListHeaderComponent={() => (
        <ListHeader
          currentDose={totalDoses}
          targetDose={settings.targetDose}
          unit={settings.unit || commonUnit}
          calendarEntries={calendarEntries}
        />
      )}
    />
  );
};

const styles = StyleSheet.create({
  timelineItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  timelineLine: {
    width: 4, // Width of the colored line
    height: '100%',
    marginRight: 8, // Spacing between the line and the card
    marginLeft: 10
  },
  card: {
    flex: 1,
    marginHorizontal: 16,
    backgroundColor: 'transparent',
  },
  timeText: {
    marginTop: 8,
  },
});
export default TimelineList;
