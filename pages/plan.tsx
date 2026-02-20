import { ScrollView, StyleSheet, View } from "react-native";
import { Card, Text, useTheme, Divider, List, ActivityIndicator } from "react-native-paper";
import { useMainStyles } from "../hooks/useMainStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import { generateLinearTaperSchedule, TaperSchedule } from "../utils/taperCalculator";
import { useMemo } from "react";
import { useTaperSettings } from "../hooks/useTaperSettings";

export const PlanPage = () => {
  const theme = useTheme();
  const mainStyles = useMainStyles(theme);
  const { settings: taperSettings, isLoading } = useTaperSettings();

  // Generate taper schedule from user settings
  const taperSchedule: TaperSchedule = useMemo(() => {
    return generateLinearTaperSchedule({
      currentDailyDose: taperSettings.startDose,
      targetDose: taperSettings.targetDose,
      timelineDays: taperSettings.durationDays,
      unit: taperSettings.unit
    });
  }, [taperSettings]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    header: {
      marginBottom: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      opacity: 0.7,
    },
    summaryCard: {
      marginBottom: 16,
      padding: 16,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    summaryLabel: {
      fontSize: 14,
      opacity: 0.7,
    },
    summaryValue: {
      fontSize: 14,
      fontWeight: '600',
    },
    scheduleCard: {
      marginBottom: 16,
    },
    scheduleHeader: {
      padding: 16,
      backgroundColor: theme.colors.primaryContainer,
    },
    scheduleTitle: {
      fontSize: 18,
      fontWeight: '600',
    },
    listItem: {
      paddingVertical: 8,
    },
    dayNumber: {
      fontWeight: '600',
      marginRight: 8,
    },
    targetDose: {
      fontSize: 16,
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Loading your taper plan...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Taper Plan</Text>
          <Text style={styles.subtitle}>
            {taperSettings.durationDays}-day personalized reduction schedule
          </Text>
        </View>

        {/* Summary Card */}
        <Card style={styles.summaryCard} elevation={2}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 12 }}>
              Plan Summary
            </Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Starting Dose:</Text>
              <Text style={styles.summaryValue}>{taperSettings.startDose} {taperSchedule.unit}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Target Dose:</Text>
              <Text style={styles.summaryValue}>{taperSettings.targetDose} {taperSchedule.unit}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Duration:</Text>
              <Text style={styles.summaryValue}>{taperSettings.durationDays} days</Text>
            </View>
            <Divider style={{ marginVertical: 8 }} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Reduction:</Text>
              <Text style={styles.summaryValue}>
                {taperSchedule.totalReduction.toFixed(2)} {taperSchedule.unit}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Daily Reduction:</Text>
              <Text style={styles.summaryValue}>
                ~{taperSchedule.averageReductionPerDay.toFixed(2)} {taperSchedule.unit}/day
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Schedule Preview */}
        <Card style={styles.scheduleCard} elevation={2}>
          <View style={styles.scheduleHeader}>
            <Text style={styles.scheduleTitle}>Daily Schedule</Text>
          </View>
          <Card.Content>
            {taperSchedule.schedule.slice(0, 7).map((day) => (
              <View key={day.day}>
                <List.Item
                  style={styles.listItem}
                  title={`Day ${day.day}`}
                  description={`Target: ${day.targetDose} ${taperSchedule.unit}`}
                  left={(props) => (
                    <List.Icon {...props} icon="calendar-check" />
                  )}
                  titleStyle={styles.dayNumber}
                />
                {day.day < 7 && <Divider />}
              </View>
            ))}
            
            {taperSchedule.schedule.length > 7 && (
              <>
                <Divider style={{ marginVertical: 8 }} />
                <Text style={{ textAlign: 'center', opacity: 0.6, marginTop: 8 }}>
                  + {taperSchedule.schedule.length - 7} more days
                </Text>
              </>
            )}
          </Card.Content>
        </Card>

        <View style={{ marginBottom: 32 }}>
          <Text style={{ textAlign: 'center', opacity: 0.5, fontSize: 12 }}>
            💡 Adjust your taper plan in Settings
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PlanPage;
