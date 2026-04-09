import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Text, Button, ActivityIndicator, useTheme } from 'react-native-paper';
import RevenueCatUI from 'react-native-purchases-ui';
import { useRevenueCat } from '../../hooks/useRevenueCat';

interface CustomerCenterProps {
  onDismiss?: () => void;
}

/**
 * RevenueCat Customer Center component
 *
 * Provides a pre-built UI for users to manage their subscriptions,
 * including viewing subscription status, changing plans, and canceling.
 *
 * @param onDismiss - Callback when customer center is dismissed
 */
export const CustomerCenter: React.FC<CustomerCenterProps> = ({ onDismiss }) => {
  const theme = useTheme();
  const { isProUser, isLoading, customerInfo } = useRevenueCat();

  const presentCustomerCenter = async () => {
    try {
      if (Platform.OS === 'web') {
        console.warn('RevenueCat Customer Center is not supported on web platform');
        return;
      }

      await RevenueCatUI.presentCustomerCenter();
      onDismiss?.();
    } catch (e) {
      console.error('Customer Center error:', e);
      onDismiss?.();
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading subscription info...</Text>
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={styles.infoText}>
          Customer Center is not available on web platform
        </Text>
        <Button mode="contained" onPress={onDismiss} style={styles.button}>
          Close
        </Button>
      </View>
    );
  }

  if (!isProUser) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={styles.infoText}>
          You don't have an active subscription
        </Text>
        <Button mode="contained" onPress={onDismiss} style={styles.button}>
          Close
        </Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={styles.title}>Manage Your Subscription</Text>

      {customerInfo && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Status: {isProUser ? 'Wean Pro Active' : 'Free'}
          </Text>
          {customerInfo.activeSubscriptions.length > 0 && (
            <Text style={styles.infoText}>
              Active Subscriptions: {customerInfo.activeSubscriptions.join(', ')}
            </Text>
          )}
        </View>
      )}

      <Button mode="contained" onPress={presentCustomerCenter} style={styles.button}>
        Open Customer Center
      </Button>

      <Button mode="text" onPress={onDismiss} style={styles.button}>
        Close
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  button: {
    marginTop: 12,
    minWidth: 200,
  },
});

export default CustomerCenter;
