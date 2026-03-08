import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import TimelineList from '../components/DailyDoseTimeline';
import ScreenTransition from '../components/ScreenTransition';
import useFireauth from '../hooks/useFireauth';
import useDesignTokens from '../hooks/useDesignTokens';

export const DailyPage = () => {
  const navigation = useNavigation();
  const { user } = useFireauth();
  const tokens = useDesignTokens();

  const handleAddDose = () => {
    navigation.navigate('Dose', { mode: 'add' });
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: tokens.colors.surface,
        },
      ]}
    >
      {user ? (
        <>
          <ScreenTransition delay={40} style={styles.content}>
            <TimelineList onAddDosePress={handleAddDose} />
          </ScreenTransition>

          <ScreenTransition delay={140} style={styles.fabWrapper}>
            <FAB
              visible
              icon="plus"
              color={tokens.colors.neutral[0]}
              style={[
                styles.fab,
                {
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.primary[400],
                  ...tokens.shadows.z3,
                },
              ]}
              onPress={handleAddDose}
            />
          </ScreenTransition>
        </>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  fabWrapper: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  fab: {
    margin: 18,
  },
});

export default DailyPage;
