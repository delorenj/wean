import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Text, Button, ActivityIndicator, useTheme } from 'react-native-paper';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { useRevenueCat } from '../../hooks/useRevenueCat';

interface PaywallProps {
  onDismiss?: () => void;
  onSuccess?: () => void;
}

/**
 * RevenueCat Paywall component with native UI
 *
 * Displays subscription offerings using RevenueCat's pre-built paywall UI.
 * Handles purchase flow and entitlement checking.
 *
 * @param onDismiss - Callback when paywall is dismissed
 * @param onSuccess - Callback when purchase succeeds
 */
export const Paywall: React.FC<PaywallProps> = ({
  onDismiss,
  onSuccess,
}) => {
  const theme = useTheme();
  const { isLoading, error, offerings } = useRevenueCat();

  const presentPaywall = async () => {
    try {
      if (Platform.OS === 'web') {
        console.warn('RevenueCat paywall is not supported on web platform');
        return;
      }

      const result = await RevenueCatUI.presentPaywall();

      switch (result) {
        case PAYWALL_RESULT.PURCHASED:
        case PAYWALL_RESULT.RESTORED:
          console.log('Purchase successful or restored');
          onSuccess?.();
          break;
        case PAYWALL_RESULT.CANCELLED:
          console.log('User cancelled paywall');
          onDismiss?.();
          break;
        case PAYWALL_RESULT.NOT_PRESENTED:
          console.log('Paywall not presented - user may already have entitlement');
          onDismiss?.();
          break;
        case PAYWALL_RESULT.ERROR:
          console.error('Error presenting paywall');
          onDismiss?.();
          break;
      }
    } catch (e) {
      console.error('Paywall error:', e);
      onDismiss?.();
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading subscription options...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          Failed to load subscription options
        </Text>
        <Text style={styles.errorDetail}>{error}</Text>
        <Button mode="contained" onPress={onDismiss} style={styles.button}>
          Close
        </Button>
      </View>
    );
  }

  if (!offerings) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={styles.errorText}>No subscription offerings available</Text>
        <Button mode="contained" onPress={onDismiss} style={styles.button}>
          Close
        </Button>
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={styles.errorText}>
          Subscriptions are not available on web platform
        </Text>
        <Button mode="contained" onPress={onDismiss} style={styles.button}>
          Close
        </Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Button mode="contained" onPress={presentPaywall} style={styles.button}>
        View Subscription Options
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorDetail: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  button: {
    marginTop: 16,
    minWidth: 200,
  },
});

export default Paywall;
