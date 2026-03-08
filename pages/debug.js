import React, { useState } from 'react';
import {StyleSheet, Text, View} from "react-native";
import {List, useTheme, Card, Title, Paragraph, Button, Snackbar} from "react-native-paper";
import {useMainStyles} from "../hooks/useMainStyles";
import useFireauth from "../hooks/useFireauth";
import {useDoses} from "../hooks/useDoses";
import {resetOnboarding} from "../utils/onboardingStorage";
import useDesignTokens from "../hooks/useDesignTokens";

export const DebugPage = () => {
  const theme = useTheme();
  const tokens = useDesignTokens();
  const styles = useMainStyles(theme);
  const {user} = useFireauth();
  const {doses} = useDoses();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleResetOnboarding = async () => {
    try {
      await resetOnboarding();
      setSnackbarMessage('Onboarding reset! Restart the app to see onboarding.');
      setSnackbarVisible(true);
    } catch (error) {
      setSnackbarMessage('Failed to reset onboarding');
      setSnackbarVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.text, { color: tokens.colors.onSurface }]}>Debug</Text>

      {/* User Details Section */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>User Details</Title>
          <Paragraph>User ID: {user?.uid}</Paragraph>
        </Card.Content>
      </Card>
      {/* Dose Section */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Dose Details</Title>
          {doses.map((dose, index) => (
            <List.Item
              key={index}
              title={`${dose.amount} ${dose.doseUnit} of ${dose.substance}`}
              description={dose.notes}
            />
          ))}
        </Card.Content>
      </Card>
      {/* Developer Tools */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Developer Tools</Title>
          <Button 
            mode="outlined" 
            onPress={handleResetOnboarding}
            style={{ marginTop: 8 }}
          >
            Reset Onboarding
          </Button>
        </Card.Content>
      </Card>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  text: {
    fontSize: 16,
  },
  card: {
    marginTop: 16,
  },
});

export default DebugPage;
