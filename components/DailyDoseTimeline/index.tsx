import React from 'react';
import {StyleSheet, FlatList, View} from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import {DailyDoseGauge} from "../DailyDoseGauge";
import {Index as RollingCalendarWeek} from "../../components/RollingCalendarWeek";

// Define the data for the timeline
const timelineData = [
  { title: 'Morning jont', description: 'Start your day with a ride...', time: '08:00 AM' },
  { title: 'Breakfast', description: 'Have a healthy breakfast...', time: '09:00 AM' },
  // Add more timeline entries here
];

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
// Vertical timeline list component
const TimelineList = () => {
  // List header component
const ListHeader = () => (
  <View>
    <RollingCalendarWeek />
    <DailyDoseGauge />
  </View>
);

  return (
    // Wrap the FlatList with a ScrollView
      <FlatList
        data={timelineData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TimelineItem title={item.title} description={item.description} time={item.time} />
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
