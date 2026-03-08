import React from 'react';
import {StyleSheet, FlatList, View} from 'react-native';
import { Title, Paragraph } from 'react-native-paper';
import {DailyDoseGauge} from "../DailyDoseGauge";
import {Index as RollingCalendarWeek} from "../../components/RollingCalendarWeek";
import { useDoses } from  '../../hooks/useDoses';
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

const ListHeader = () => (
  <View>
    <RollingCalendarWeek />
    <DailyDoseGauge />
  </View>
);

// Vertical timeline list component
const TimelineList = () => {
  const tokens = useDesignTokens();
  // Define the data for the timeline
  const { doses } = useDoses();

  return (
    // Wrap the FlatList with a ScrollView
      <FlatList
        data={doses}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TimelineItem title={item.substance} description={item.amount} time={item.doseUnit} tokens={tokens} />
        )}
        ListHeaderComponent={ListHeader}

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
