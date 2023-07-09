import React from 'react';
import {StyleSheet, FlatList, View} from 'react-native';
import { Title, Paragraph } from 'react-native-paper';
import {DailyDoseGauge} from "../DailyDoseGauge";
import {Index as RollingCalendarWeek} from "../../components/RollingCalendarWeek";
import { useDoses } from  '../../hooks/useDoses';

// Custom TimelineItem component
const TimelineItem = ({ title, description, time }) => (
  <View style={styles.timelineItemContainer}>
    {/* Vertical colored line */}
    <View style={styles.timelineLine} />
    {/* Card content */}
    <View style={styles.card}>
      <View>
        <Title>{title}</Title>
        <Paragraph>{description}</Paragraph>
        <Paragraph style={styles.timeText}>{time}</Paragraph>
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
// Vertical timeline list component
const TimelineList = () => {
  // Define the data for the timeline
  const { doses } = useDoses();

  return (
    // Wrap the FlatList with a ScrollView
      <FlatList
        data={doses}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TimelineItem title={item.substance} description={item.amount} time={item.doseUnit} />
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
    backgroundColor: '#FF5733', // Color of the line
    marginRight: 8, // Spacing between the line and the card
    marginLeft: 10
  },
  card: {
    flex: 1,
    marginHorizontal: 16,
    backgroundColor: 'transparent',
  },
  timeText: {
    color: '#888',
    marginTop: 8,
  },
});
export default TimelineList;
