import React, { useMemo } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Text } from 'react-native-paper';
import useDesignTokens from '../hooks/useDesignTokens';
import { useRevenueCat } from '../hooks/useRevenueCat';
import { Paywall } from '../components/Paywall';
import ScreenTransition from '../components/ScreenTransition';
import GoalSetting from '../components/GoalSetting';
import useGoals from '../hooks/useGoals';

const usePremiumAccess = () => {
  try {
    const { isProUser, isLoading } = useRevenueCat();

    return {
      isLoading,
      isPremiumUnlocked: Platform.OS === 'web' || isProUser,
    };
  } catch {
    return {
      isLoading: false,
      isPremiumUnlocked: true,
    };
  }
};

export const GoalsPage = () => {
  const { colors, spacing, typography } = useDesignTokens();
  const premiumAccess = usePremiumAccess();

  const {
    goal,
    goalHistory,
    isLoading,
    error,
    currentDose,
    progressPercentage,
    celebrationMilestone,
    saveGoal,
    abandonGoal,
    completeGoal,
    dismissCelebration,
  } = useGoals(premiumAccess.isPremiumUnlocked);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safeArea: {
          flex: 1,
          backgroundColor: colors.surface,
        },
        content: {
          paddingHorizontal: spacing[16],
          paddingTop: spacing[12],
          paddingBottom: spacing[32],
          gap: spacing[16],
        },
        pageTitle: {
          color: colors.onSurface,
          fontSize: typography.headlineSmall.fontSize,
          lineHeight: typography.headlineSmall.lineHeight,
          fontWeight: typography.headlineSmall.fontWeight as '600',
        },
        pageSubtitle: {
          color: colors.onSurfaceVariant,
          fontSize: typography.bodyMedium.fontSize,
          lineHeight: typography.bodyMedium.lineHeight,
          fontWeight: typography.bodyMedium.fontWeight as '400',
          marginTop: spacing[4],
        },
      }),
    [colors, spacing, typography]
  );

  if (isLoading || premiumAccess.isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[12] }}>
          <ActivityIndicator size="large" />
          <Text style={{ color: colors.onSurfaceVariant }}>Loading your goals...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!premiumAccess.isPremiumUnlocked) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, padding: spacing[16], gap: spacing[16] }}>
          <ScreenTransition delay={20}>
            <View>
              <Text style={styles.pageTitle}>Goal Setting & Milestones</Text>
              <Text style={styles.pageSubtitle}>
                Premium unlock: set taper goals, track milestone progress, and stay motivated.
              </Text>
            </View>
          </ScreenTransition>

          <ScreenTransition delay={90}>
            <Paywall />
          </ScreenTransition>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenTransition delay={20}>
          <View>
            <Text style={styles.pageTitle}>Goal Setting & Milestones</Text>
            <Text style={styles.pageSubtitle}>
              Set a target, watch your progress climb, and celebrate every milestone in your taper journey.
            </Text>
          </View>
        </ScreenTransition>

        <ScreenTransition delay={90}>
          <GoalSetting
            goal={goal}
            goalHistory={goalHistory}
            currentDose={currentDose}
            progressPercentage={progressPercentage}
            celebrationMilestone={celebrationMilestone}
            errorMessage={error}
            onSave={saveGoal}
            onAbandon={abandonGoal}
            onComplete={completeGoal}
            onDismissCelebration={dismissCelebration}
          />
        </ScreenTransition>
      </ScrollView>
    </SafeAreaView>
  );
};

export default GoalsPage;
