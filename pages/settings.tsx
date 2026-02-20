import {ScrollView, View, StyleSheet} from "react-native";
import {useTheme, Text, Divider, List, Switch, Portal, Modal, Chip, Button, TextInput} from "react-native-paper";
import {useMainStyles} from "../hooks/useMainStyles";
import {SafeAreaView} from "react-native-safe-area-context";
import useSettings from "../hooks/useSettings";
import {SettingsProviderType} from "../hooks/useSettings";
import {useState} from "react";
import {useRevenueCat} from "../hooks/useRevenueCat";
import {Paywall} from "../components/Paywall";
import {CustomerCenter} from "../components/CustomerCenter";
import {useTaperSettings} from "../hooks/useTaperSettings";
import {TaperSettings} from "../utils/taperSettings";

export const SettingsPage = () => {
  const theme = useTheme()
  const styles = useMainStyles(theme)
  const { settings, toggleDarkMode }: SettingsProviderType = useSettings();
  const { isProUser, isLoading } = useRevenueCat();
  const [showPaywall, setShowPaywall] = useState(false);
  const [showCustomerCenter, setShowCustomerCenter] = useState(false);
  
  // Taper settings
  const { settings: taperSettings, updateSettings: updateTaperSettings } = useTaperSettings();
  const [showTaperConfig, setShowTaperConfig] = useState(false);
  const [editingTaper, setEditingTaper] = useState<TaperSettings>(taperSettings);

  const handleSubscriptionPress = () => {
    if (isProUser) {
      setShowCustomerCenter(true);
    } else {
      setShowPaywall(true);
    }
  };

  const handleTaperConfigPress = () => {
    setEditingTaper(taperSettings);
    setShowTaperConfig(true);
  };

  const handleSaveTaperConfig = async () => {
    try {
      await updateTaperSettings(editingTaper);
      setShowTaperConfig(false);
    } catch (error) {
      console.error('Failed to save taper config:', error);
      // TODO: Show error toast/snackbar
    }
  };

  const modalStyles = StyleSheet.create({
    modalContent: {
      backgroundColor: theme.colors.background,
      margin: 20,
      padding: 20,
      borderRadius: 8,
      maxHeight: '80%',
    },
    inputRow: {
      marginBottom: 16,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 8,
      marginTop: 16,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text variant='headlineLarge' style={{padding: 20}}>Settings</Text>
        <Divider />

        <List.Section title="Subscription">
          <List.Item
            title={isProUser ? "Manage Subscription" : "Upgrade to Pro"}
            description={isProUser ? "Wean Pro Active" : "Unlock all features"}
            left={() => (
              <List.Icon icon={isProUser ? "crown" : "star"} />
            )}
            right={() => (
              !isLoading && isProUser ? (
                <Chip mode="flat" style={{ backgroundColor: theme.colors.primaryContainer }}>
                  Pro
                </Chip>
              ) : null
            )}
            onPress={handleSubscriptionPress}
          />
        </List.Section>

        <Divider />

        <List.Section title="Taper Plan">
          <List.Item
            title="Configure Taper Schedule"
            description={`${taperSettings.startDose} → ${taperSettings.targetDose} ${taperSettings.unit} over ${taperSettings.durationDays} days`}
            left={() => (
              <List.Icon icon="chart-line" />
            )}
            onPress={handleTaperConfigPress}
          />
        </List.Section>

        <Divider />

        <List.Section title="Appearance">
          <List.Item
            title="Dark Mode"
            left={() => (
              <List.Icon icon="brightness-4" />
            )}
            right={() => (
              <Switch
                trackColor={{ true: '#3498db', false: '#95a5a6' }}
                value={settings.darkMode}
                onValueChange={toggleDarkMode}
              />
            )}
          />
        </List.Section>

        {/* Paywall Modal */}
        <Portal>
          <Modal
            visible={showPaywall}
            onDismiss={() => setShowPaywall(false)}
            contentContainerStyle={{
              margin: 20,
              borderRadius: 8,
              maxHeight: '80%',
              backgroundColor: theme.colors.background,
            }}
          >
            <Paywall
              onDismiss={() => setShowPaywall(false)}
              onSuccess={() => {
                setShowPaywall(false);
              }}
            />
          </Modal>
        </Portal>

        {/* Customer Center Modal */}
        <Portal>
          <Modal
            visible={showCustomerCenter}
            onDismiss={() => setShowCustomerCenter(false)}
            contentContainerStyle={{
              margin: 20,
              borderRadius: 8,
              maxHeight: '80%',
              backgroundColor: theme.colors.background,
            }}
          >
            <CustomerCenter onDismiss={() => setShowCustomerCenter(false)} />
          </Modal>
        </Portal>

        {/* Taper Configuration Modal */}
        <Portal>
          <Modal
            visible={showTaperConfig}
            onDismiss={() => setShowTaperConfig(false)}
            contentContainerStyle={modalStyles.modalContent}
          >
            <Text variant="headlineSmall" style={{ marginBottom: 16 }}>
              Taper Configuration
            </Text>

            <View style={modalStyles.inputRow}>
              <TextInput
                label="Starting Dose"
                mode="outlined"
                keyboardType="numeric"
                value={String(editingTaper.startDose)}
                onChangeText={(text) => {
                  const num = parseFloat(text) || 0;
                  setEditingTaper({ ...editingTaper, startDose: num });
                }}
              />
            </View>

            <View style={modalStyles.inputRow}>
              <TextInput
                label="Target Dose"
                mode="outlined"
                keyboardType="numeric"
                value={String(editingTaper.targetDose)}
                onChangeText={(text) => {
                  const num = parseFloat(text) || 0;
                  setEditingTaper({ ...editingTaper, targetDose: num });
                }}
              />
            </View>

            <View style={modalStyles.inputRow}>
              <TextInput
                label="Duration (days)"
                mode="outlined"
                keyboardType="numeric"
                value={String(editingTaper.durationDays)}
                onChangeText={(text) => {
                  const num = parseInt(text, 10) || 1;
                  setEditingTaper({ ...editingTaper, durationDays: num });
                }}
              />
            </View>

            <View style={modalStyles.inputRow}>
              <TextInput
                label="Unit (e.g., g, mg, ml)"
                mode="outlined"
                value={editingTaper.unit}
                onChangeText={(text) => {
                  setEditingTaper({ ...editingTaper, unit: text });
                }}
              />
            </View>

            <View style={modalStyles.buttonRow}>
              <Button
                mode="outlined"
                onPress={() => setShowTaperConfig(false)}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSaveTaperConfig}
              >
                Save
              </Button>
            </View>
          </Modal>
        </Portal>
      </ScrollView>
    </SafeAreaView>
  );
}

export default SettingsPage;
