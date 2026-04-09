import React, { useReducer } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Button,
  Dialog,
  List,
  Portal,
  SegmentedButtons,
  Snackbar,
  Switch,
  Text,
  TextInput,
} from 'react-native-paper';
import Constants from 'expo-constants';
import { useAppTheme } from '../context/themeProvider';
import {
  DoseUnitPreference,
  SortOrderPreference,
  ThemePreference,
} from '../hooks/useSettings.helpers';
import useDesignTokens from '../hooks/useDesignTokens';
import useSyncStatus from '../hooks/useSyncStatus';
import ScreenTransition from '../components/ScreenTransition';
import { getCardSurfaceStyle } from '../src/theme';
import SyncStatusIndicator from '../components/SyncStatusIndicator';
import {
  accountDeletionUiReducer,
  initialAccountDeletionUiState,
  isDeletionConfirmationValid,
  mapAccountDeletionErrorMessage,
} from '../hooks/accountDeletion.helpers';
import useAccountDeletion from '../hooks/useAccountDeletion';
import { requestOnboardingReset } from '../utils/onboardingFlow';

const PRIVACY_POLICY_URL = 'https://wean.app/privacy';
const TERMS_OF_SERVICE_URL = 'https://wean.app/terms';

export const SettingsPage = () => {
  const tokens = useDesignTokens();
  const { colors, spacing, typography } = tokens;
  const cardSurfaceStyle = getCardSurfaceStyle(tokens);
  const {
    settings,
    setThemePreference,
    setDefaultDoseUnit,
    setSortOrder,
    setNotificationsEnabled,
  } = useAppTheme();
  const { status, lastSyncLabel, syncNow } = useSyncStatus();
  const { deleteAccount } = useAccountDeletion();

  const [accountDeletionState, dispatchAccountDeletion] = useReducer(
    accountDeletionUiReducer,
    initialAccountDeletionUiState
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    content: {
      paddingHorizontal: spacing[16],
      paddingTop: spacing[12],
      paddingBottom: spacing[32],
      gap: spacing[12],
    },
    title: {
      fontSize: typography.headlineSmall.fontSize,
      lineHeight: typography.headlineSmall.lineHeight,
      fontWeight: '700',
      color: colors.onSurface,
      marginBottom: spacing[4],
    },
    sectionCard: {
      ...cardSurfaceStyle,
      paddingHorizontal: spacing[8],
      paddingBottom: spacing[8],
    },
    listSection: {
      marginTop: spacing[8],
      marginBottom: 0,
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
    warningText: {
      color: colors.error,
      marginBottom: spacing[12],
      fontSize: typography.bodyMedium.fontSize,
      lineHeight: typography.bodyMedium.lineHeight,
    },
    deleteInput: {
      backgroundColor: colors.surface,
    },
    dialogButton: {
      minWidth: 108,
    },
    dialogDeleteButton: {
      borderColor: colors.error,
    },
  });

  const handleThemeChange = (value: string) => {
    void setThemePreference(value as ThemePreference);
  };

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

  const handleDeleteAccount = async () => {
    const isValidConfirmation = isDeletionConfirmationValid(accountDeletionState.confirmationInput);

    if (!isValidConfirmation) {
      dispatchAccountDeletion({ type: 'deletionFailed', payload: 'Type DELETE to confirm account deletion.' });
      return;
    }

    dispatchAccountDeletion({ type: 'startDeletion' });

    try {
      await deleteAccount();

      dispatchAccountDeletion({
        type: 'deletionSuccess',
        payload: 'Your account and data were deleted successfully.',
      });

      Alert.alert('Account deleted', 'Your account and data were deleted successfully.');
      requestOnboardingReset();
    } catch (error) {
      dispatchAccountDeletion({
        type: 'deletionFailed',
        payload: mapAccountDeletionErrorMessage(error),
      });
    }
  };

  const appVersion = Constants.expoConfig?.version ?? 'dev';
  const canConfirmDelete = isDeletionConfirmationValid(accountDeletionState.confirmationInput);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenTransition delay={20}>
          <Text style={styles.title}>Settings</Text>
        </ScreenTransition>

        <ScreenTransition delay={60}>
          <View style={styles.sectionCard}>
            <List.Section title="Data Sync" style={styles.listSection}>
              <SyncStatusIndicator status={status} lastSyncLabel={lastSyncLabel} onSyncNow={syncNow} />
            </List.Section>
          </View>
        </ScreenTransition>

        <ScreenTransition delay={90}>
          <View style={styles.sectionCard}>
            <List.Section title="App Preferences" style={styles.listSection}>
              <View style={styles.segmentedWrapper}>
                <Text style={styles.segmentedLabel}>Theme</Text>
                <SegmentedButtons
                  value={settings.theme}
                  onValueChange={handleThemeChange}
                  buttons={[
                    { value: 'light', label: 'Light' },
                    { value: 'dark', label: 'Dark' },
                  ]}
                />
              </View>

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
          </View>
        </ScreenTransition>

        <ScreenTransition delay={120}>
          <View style={styles.sectionCard}>
            <List.Section title="Notifications" style={styles.listSection}>
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
          </View>
        </ScreenTransition>

        <ScreenTransition delay={150}>
          <View style={styles.sectionCard}>
            <List.Section title="Account" style={styles.listSection}>
              <List.Item
                title="Delete Account"
                description="Permanently remove your account and all data"
                titleStyle={styles.dangerText}
                left={(props) => <List.Icon {...props} icon="delete-outline" color={colors.error} />}
                onPress={() => {
                  dispatchAccountDeletion({ type: 'openDialog' });
                }}
              />
            </List.Section>
          </View>
        </ScreenTransition>

        <ScreenTransition delay={180}>
          <View style={styles.sectionCard}>
            <List.Section title="About" style={styles.listSection}>
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
          </View>
        </ScreenTransition>
      </ScrollView>

      <Portal>
        <Dialog
          visible={accountDeletionState.isDialogVisible}
          onDismiss={() => {
            if (accountDeletionState.isDeleting) {
              return;
            }

            dispatchAccountDeletion({ type: 'closeDialog' });
          }}
        >
          <Dialog.Title>Delete account?</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.warningText}>
              This action is permanent. All doses, settings, and local app data will be deleted.
            </Text>
            <TextInput
              label='Type "DELETE" to confirm'
              mode="outlined"
              value={accountDeletionState.confirmationInput}
              onChangeText={(text) => {
                dispatchAccountDeletion({ type: 'updateInput', payload: text });
              }}
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!accountDeletionState.isDeleting}
              style={styles.deleteInput}
            />
            {accountDeletionState.errorMessage ? (
              <Text style={styles.warningText}>{accountDeletionState.errorMessage}</Text>
            ) : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              mode="text"
              style={styles.dialogButton}
              disabled={accountDeletionState.isDeleting}
              onPress={() => {
                dispatchAccountDeletion({ type: 'closeDialog' });
              }}
            >
              Cancel
            </Button>
            <Button
              mode="outlined"
              textColor={colors.error}
              style={[styles.dialogButton, styles.dialogDeleteButton]}
              disabled={!canConfirmDelete || accountDeletionState.isDeleting}
              loading={accountDeletionState.isDeleting}
              onPress={() => {
                void handleDeleteAccount();
              }}
            >
              {accountDeletionState.isDeleting ? 'Deleting…' : 'Delete account'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={Boolean(accountDeletionState.successMessage)}
        onDismiss={() => {
          dispatchAccountDeletion({ type: 'closeDialog' });
        }}
        duration={3000}
      >
        {accountDeletionState.successMessage}
      </Snackbar>
    </SafeAreaView>
  );
};

export default SettingsPage;
