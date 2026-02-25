import React, { ReactNode, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card, useTheme, Portal, Modal } from 'react-native-paper';
import { useRevenueCat } from '../../hooks/useRevenueCat';
import { Paywall } from '../Paywall';
import MinimalIcon from '../MinimalIcon';

interface ProFeatureGateProps {
  children: ReactNode;
  feature?: string;
  description?: string;
  showOverlay?: boolean;
}

/**
 * ProFeatureGate component
 *
 * Wraps content that requires Wean Pro subscription.
 * Shows upgrade prompt for free users, renders children for pro users.
 *
 * @param children - Content to render for pro users
 * @param feature - Name of the gated feature (e.g., "Advanced Insights")
 * @param description - Description of what the feature provides
 * @param showOverlay - If true, shows content with lock overlay instead of replacing it
 *
 * @example
 * <ProFeatureGate feature="Advanced Analytics" description="View detailed trends and patterns">
 *   <AdvancedAnalytics />
 * </ProFeatureGate>
 */
export const ProFeatureGate: React.FC<ProFeatureGateProps> = ({
  children,
  feature = 'This Feature',
  description = 'Unlock this feature with Wean Pro',
  showOverlay = false,
}) => {
  const theme = useTheme();
  const { isProUser, isLoading } = useRevenueCat();
  const [showPaywall, setShowPaywall] = useState(false);

  // Show loading state
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
        <MinimalIcon
          name="loading"
          size={32}
          color={theme.colors.primary}
        />
      </View>
    );
  }

  // User has pro - render content
  if (isProUser) {
    return <>{children}</>;
  }

  // User is free - show upgrade prompt
  if (showOverlay) {
    // Show content with lock overlay
    return (
      <View style={styles.overlayContainer}>
        <View style={styles.blurredContent}>
          {children}
        </View>
        <View style={[styles.overlay, { backgroundColor: theme.colors.background }]}>
          <MinimalIcon
            name="lock"
            size={48}
            color={theme.colors.primary}
          />
          <Text variant="headlineSmall" style={styles.featureTitle}>
            {feature}
          </Text>
          <Text variant="bodyMedium" style={styles.description}>
            {description}
          </Text>
          <Button
            mode="contained"
            onPress={() => setShowPaywall(true)}
            style={styles.upgradeButton}
            icon="crown"
          >
            Upgrade to Pro
          </Button>
        </View>

        <Portal>
          <Modal
            visible={showPaywall}
            onDismiss={() => setShowPaywall(false)}
            contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.background }]}
          >
            <Paywall
              onDismiss={() => setShowPaywall(false)}
              onSuccess={() => setShowPaywall(false)}
            />
          </Modal>
        </Portal>
      </View>
    );
  }

  // Replace content with upgrade card
  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content style={styles.cardContent}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
          <MinimalIcon
            name="crown"
            size={48}
            color={theme.colors.primary}
          />
        </View>

        <Text variant="headlineSmall" style={styles.featureTitle}>
          {feature}
        </Text>

        <Text variant="bodyMedium" style={styles.description}>
          {description}
        </Text>

        <View style={styles.benefitsContainer}>
          <View style={styles.benefit}>
            <MinimalIcon
              name="check-circle"
              size={20}
              color={theme.colors.primary}
            />
            <Text style={styles.benefitText}>Unlimited tracking</Text>
          </View>
          <View style={styles.benefit}>
            <MinimalIcon
              name="check-circle"
              size={20}
              color={theme.colors.primary}
            />
            <Text style={styles.benefitText}>Advanced insights</Text>
          </View>
          <View style={styles.benefit}>
            <MinimalIcon
              name="check-circle"
              size={20}
              color={theme.colors.primary}
            />
            <Text style={styles.benefitText}>Custom plans</Text>
          </View>
          <View style={styles.benefit}>
            <MinimalIcon
              name="check-circle"
              size={20}
              color={theme.colors.primary}
            />
            <Text style={styles.benefitText}>Data export</Text>
          </View>
        </View>

        <Button
          mode="contained"
          onPress={() => setShowPaywall(true)}
          style={styles.upgradeButton}
          icon="crown"
        >
          Upgrade to Wean Pro
        </Button>

        <Text variant="bodySmall" style={styles.hint}>
          7-day free trial • Cancel anytime
        </Text>
      </Card.Content>

      <Portal>
        <Modal
          visible={showPaywall}
          onDismiss={() => setShowPaywall(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.background }]}
        >
          <Paywall
            onDismiss={() => setShowPaywall(false)}
            onSuccess={() => setShowPaywall(false)}
          />
        </Modal>
      </Portal>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    margin: 16,
    elevation: 4,
  },
  cardContent: {
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    marginBottom: 24,
    textAlign: 'center',
    opacity: 0.8,
  },
  benefitsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    marginLeft: 12,
    fontSize: 16,
  },
  upgradeButton: {
    marginBottom: 12,
    paddingHorizontal: 24,
  },
  hint: {
    opacity: 0.6,
    textAlign: 'center',
  },
  modal: {
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  overlayContainer: {
    position: 'relative',
  },
  blurredContent: {
    opacity: 0.3,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default ProFeatureGate;
