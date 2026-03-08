import React, { useState } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Divider,
  Dialog,
  List,
  Portal,
  SegmentedButtons,
  Switch,
  Text,
  useTheme,
} from 'react-native-paper';
import Constants from 'expo-constants';
import useSettings from '../hooks/useSettings';
import { DoseUnitPreference, SortOrderPreference } from '../hooks/useSettings.helpers';
import useDesignTokens from '../hooks/useDesignTokens';

const PRIVACY_POLICY_URL = 'https://wean.app/privacy';
const TERMS_OF_SERVICE_URL = 'https://wean.app/terms';

export const SettingsPage = () => {
  const theme = useTheme();
  const { colors, spacing, typography } = useDesignTokens();
  const {
    settings,
    toggleDarkMode,
    setDefaultDoseUnit,
    setSortOrder,
    setNotificationsEnabled,
  } = useSettings();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      paddingBottom: spacing[32],
    },
    title: {
      fontSize: typography.headlineLarge.fontSize,
      lineHeight: typography.headlineLarge.lineHeight,
      fontWeight: '600',
      paddingHorizontal: spacing[20],
      paddingTop: spacing[20],
      paddingBottom: spacing[12],
      color: colors.onSurface,
    },
    segmentedWrapper: {
      paddingHorizontal: spacing[16],
      paddingBottom: spacing[12],
      gap: spacing[8],
    },
    segmentedLabel: {
      fontSize: typography.bodyMedium.fontSize,
      lineHeight: typography.bodyMedium.lineHeight,
      fontWeight: '400',
      color: colors.onSurfaceVariant,
    },
    dangerText: {
      color: colors.error,
    },
    linkText: {
      color: colors.info,
    },
  });

  const handleDoseUnitChange = (value: string) => {
    void setDefaultDoseUnit(value as DoseUnitPreference);
  };

  const handleSortOrderChange = (value: string) => {
    void setSortOrder(value as SortOrderPreference);
  };

  const openExternalLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error(`Failed to open link: ${url}`, error);
    }
  };

  const appVersion = Constants.expoConfig?.version ?? 'dev';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>

        <List.Section title="App Preferences">
          <List.Item
            title="Dark Theme"
            description="Use dark colors across the app"
            left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => (
              <Switch
                value={settings.darkMode}
                onValueChange={() => {
                  void toggleDarkMode();
                }}
              />
            )}
          />

          <View style={styles.segmentedWrapper}>
            <Text style={styles.segmentedLabel}>Default Dose Unit</Text>
            <SegmentedButtons
              value={settings.defaultDoseUnit}
              onValueChange={handleDoseUnitChange}
              buttons={[
                { value: 'g', label: 'g' },
                { value: 'oz', label: 'oz' },
              ]}
            />
          </View>

          <View style={styles.segmentedWrapper}>
            <Text style={styles.segmentedLabel}>Dose Sort Order</Text>
            <SegmentedButtons
              value={settings.sortOrder}
              onValueChange={handleSortOrderChange}
              buttons={[
                { value: 'newest', label: 'Newest first' },
                { value: 'oldest', label: 'Oldest first' },
              ]}
            />
          </View>
        </List.Section>

        <Divider />

        <List.Section title="Notifications">
          <List.Item
            title="Enable Notifications"
            description="Master toggle for reminders"
            left={(props) => <List.Icon {...props} icon="bell-ring-outline" />}
            right={() => (
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={(value) => {
                  void setNotificationsEnabled(value);
                }}
              />
            )}
          />
          <List.Item
            title="Reminder Times"
            description="Coming soon"
            left={(props) => <List.Icon {...props} icon="clock-outline" />}
          />
        </List.Section>

        <Divider />

        <List.Section title="Account">
          <List.Item
            title="Delete Account"
            description="Permanently remove your account (coming soon)"
            titleStyle={styles.dangerText}
            left={(props) => <List.Icon {...props} icon="delete-outline" color={colors.error} />}
            onPress={() => setShowDeleteDialog(true)}
          />
        </List.Section>

        <Divider />

        <List.Section title="About">
          <List.Item
            title="App Version"
            description={appVersion}
            left={(props) => <List.Icon {...props} icon="information-outline" />}
          />
          <List.Item
            title="Privacy Policy"
            description={PRIVACY_POLICY_URL}
            descriptionStyle={styles.linkText}
            left={(props) => <List.Icon {...props} icon="shield-account-outline" />}
            onPress={() => {
              void openExternalLink(PRIVACY_POLICY_URL);
            }}
          />
          <List.Item
            title="Terms of Service"
            description={TERMS_OF_SERVICE_URL}
            descriptionStyle={styles.linkText}
            left={(props) => <List.Icon {...props} icon="file-document-outline" />}
            onPress={() => {
              void openExternalLink(TERMS_OF_SERVICE_URL);
            }}
          />
        </List.Section>
      </ScrollView>

      <Portal>
        <Dialog visible={showDeleteDialog} onDismiss={() => setShowDeleteDialog(false)}>
          <Dialog.Title>Delete account?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              This action will be permanent once implemented. For now this is a placeholder while account deletion is under development.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Text
              onPress={() => setShowDeleteDialog(false)}
              style={{ marginRight: spacing[16], color: colors.onSurfaceVariant }}
            >
              Cancel
            </Text>
            <Text onPress={() => setShowDeleteDialog(false)} style={styles.dangerText}>
              I Understand
            </Text>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};

export default SettingsPage;
