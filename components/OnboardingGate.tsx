/**
 * Onboarding Gate
 *
 * Checks if user has completed onboarding and routes accordingly
 */

import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { isOnboardingCompleted } from '../utils/onboardingStorage';
import OnboardingPage from '../pages/onboarding';
import { Tabs } from './tabs';

export const OnboardingGate: React.FC = () => {
  const [isChecking, setIsChecking] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [initialRouteName, setInitialRouteName] = useState<'Daily' | 'Dose'>('Daily');

  useEffect(() => {
    void checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const completed = await isOnboardingCompleted();
      setHasCompletedOnboarding(completed);
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
      // On error, assume not completed (safer to show onboarding)
      setHasCompletedOnboarding(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleOnboardingComplete = () => {
    setInitialRouteName('Dose');
    setHasCompletedOnboarding(true);
  };

  if (isChecking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Loading...</Text>
      </View>
    );
  }

  if (!hasCompletedOnboarding) {
    return <OnboardingPage onComplete={handleOnboardingComplete} />;
  }

  return <Tabs initialRouteName={initialRouteName} />;
};
