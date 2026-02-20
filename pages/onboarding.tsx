/**
 * Onboarding Page
 * 
 * First-run experience to collect taper basics
 */

import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  TextInput,
  Button,
  Card,
  useTheme,
  HelperText
} from 'react-native-paper';
import { saveTaperSettings, TaperSettings, DEFAULT_TAPER_SETTINGS } from '../utils/taperSettings';
import { markOnboardingCompleted } from '../utils/onboardingStorage';

interface OnboardingPageProps {
  onComplete: () => void;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ onComplete }) => {
  const theme = useTheme();
  
  const [startDose, setStartDose] = useState<string>('');
  const [targetDose, setTargetDose] = useState<string>('0');
  const [durationDays, setDurationDays] = useState<string>('30');
  const [unit, setUnit] = useState<string>('mg');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    const start = parseFloat(startDose);
    const target = parseFloat(targetDose);
    const days = parseInt(durationDays, 10);
    
    if (!startDose || isNaN(start) || start <= 0) {
      newErrors.startDose = 'Enter your current daily dose';
    }
    
    if (isNaN(target) || target < 0) {
      newErrors.targetDose = 'Target dose must be 0 or greater';
    }
    
    if (!isNaN(start) && !isNaN(target) && target > start) {
      newErrors.targetDose = 'Target dose cannot exceed starting dose';
    }
    
    if (!durationDays || isNaN(days) || days < 1) {
      newErrors.durationDays = 'Duration must be at least 1 day';
    }
    
    if (!unit.trim()) {
      newErrors.unit = 'Enter a unit (e.g., mg, g, ml)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const settings: TaperSettings = {
        startDose: parseFloat(startDose),
        targetDose: parseFloat(targetDose),
        durationDays: parseInt(durationDays, 10),
        unit: unit.trim()
      };
      
      await saveTaperSettings(settings);
      await markOnboardingCompleted();
      onComplete();
    } catch (error) {
      console.error('Failed to save onboarding settings:', error);
      setErrors({ submit: 'Failed to save settings. Please try again.' });
      setIsSubmitting(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
    },
    header: {
      marginBottom: 24,
      marginTop: 16,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      opacity: 0.7,
      lineHeight: 24,
    },
    card: {
      marginBottom: 16,
      padding: 16,
    },
    input: {
      marginBottom: 8,
    },
    buttonContainer: {
      marginTop: 24,
      marginBottom: 16,
    },
    infoText: {
      fontSize: 14,
      opacity: 0.6,
      textAlign: 'center',
      marginTop: 16,
      lineHeight: 20,
    }
  });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to Wean 🌿</Text>
          <Text style={styles.subtitle}>
            Let's set up your personalized taper plan. You can adjust these settings anytime.
          </Text>
        </View>

        <Card style={styles.card} elevation={2}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 16 }}>
              Your Taper Basics
            </Text>

            <TextInput
              label="Current Daily Dose *"
              value={startDose}
              onChangeText={setStartDose}
              keyboardType="decimal-pad"
              mode="outlined"
              style={styles.input}
              error={!!errors.startDose}
              placeholder="e.g., 20"
            />
            <HelperText type="error" visible={!!errors.startDose}>
              {errors.startDose}
            </HelperText>

            <TextInput
              label="Target Dose"
              value={targetDose}
              onChangeText={setTargetDose}
              keyboardType="decimal-pad"
              mode="outlined"
              style={styles.input}
              error={!!errors.targetDose}
              placeholder="0"
            />
            <HelperText type="error" visible={!!errors.targetDose}>
              {errors.targetDose}
            </HelperText>

            <TextInput
              label="Taper Duration (days)"
              value={durationDays}
              onChangeText={setDurationDays}
              keyboardType="number-pad"
              mode="outlined"
              style={styles.input}
              error={!!errors.durationDays}
              placeholder="30"
            />
            <HelperText type="error" visible={!!errors.durationDays}>
              {errors.durationDays}
            </HelperText>

            <TextInput
              label="Unit"
              value={unit}
              onChangeText={setUnit}
              mode="outlined"
              style={styles.input}
              error={!!errors.unit}
              placeholder="mg, g, ml, etc."
            />
            <HelperText type="error" visible={!!errors.unit}>
              {errors.unit}
            </HelperText>

            {errors.submit && (
              <HelperText type="error" visible={true}>
                {errors.submit}
              </HelperText>
            )}
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            contentStyle={{ paddingVertical: 8 }}
          >
            Get Started
          </Button>
        </View>

        <Text style={styles.infoText}>
          💡 Your data stays on your device. We don't store personal health information.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OnboardingPage;
