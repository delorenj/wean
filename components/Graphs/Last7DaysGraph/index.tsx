import React from 'react';
import {StyleSheet, View, Dimensions} from "react-native";
import {useTheme} from 'react-native-paper';
import { useDoses } from  '../../../hooks/useDoses';
import {LineChart} from "react-native-chart-kit";
import {useMainStyles} from "../../../hooks/useMainStyles";

const Last7DaysGraph = () => {
  // Define the data for the timeline
  const { doses } = useDoses();
  const theme = useTheme()
  const styles = useMainStyles(theme)

  // Mock data for the Line Chart
  const data = {
    labels: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43, 22],
        strokeWidth: 2
      }
    ]
  };

  return (
    <View style={styles.container}>
      <LineChart
        data={data}
        width={Dimensions.get("window").width} // from react-native
        height={240}
        yAxisSuffix={"g"}
        yAxisInterval={1} // optional, defaults to 1
        chartConfig={{
          backgroundColor: "#e26a00",
          backgroundGradientFrom: "#fb8c00",
          backgroundGradientTo: "#ffa726",
          decimalPlaces: 1, // optional, defaults to 2dp
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16
          },
          propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: "#ffa726"
          }
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16
        }}
      />
    </View>
  );

};

export default Last7DaysGraph;
