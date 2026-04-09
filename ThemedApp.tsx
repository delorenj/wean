import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { OnboardingGate } from './components/OnboardingGate';
import { useAppTheme } from './context/themeProvider';

export const ThemedApp = () => {
  const { paperTheme, statusBarStyle } = useAppTheme();

  return (
    <PaperProvider theme={paperTheme}>
      <StatusBar style={statusBarStyle} backgroundColor={paperTheme.colors.background} />
      <NavigationContainer theme={paperTheme}>
        <OnboardingGate />
      </NavigationContainer>
    </PaperProvider>
  );
};
