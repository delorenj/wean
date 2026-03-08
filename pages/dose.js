import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Timestamp } from 'firebase/firestore';
import { useTheme } from 'react-native-paper';
import QuickDoseEntry from '../components/QuickDoseEntry';
import useDesignTokens from '../hooks/useDesignTokens';
import { useDoses } from '../hooks/useDoses';
import {
  normalizeDoseAmountForEntry,
  normalizeDoseUnitForEntry,
  resolveDoseMode,
  toEntryTimestampDate,
} from './dose.helpers';

export const DosePage = () => {
  const tokens = useDesignTokens();
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { doses, addDose, updateDose } = useDoses();

  const routeParams = route?.params;
  const mode = resolveDoseMode(routeParams);
  const doseId = routeParams?.doseId;

  const doseToEdit = useMemo(() => {
    if (mode !== 'edit' || !doseId) {
      return undefined;
    }

    return doses.find((dose) => dose.id === doseId);
  }, [doses, doseId, mode]);

  const handleCancel = () => {
    navigation.navigate('Daily');
  };

  const handleSubmit = async (payload) => {
    const normalizedDate = Timestamp.fromDate(payload.timestamp);

    if (mode === 'edit' && doseId) {
      await updateDose(doseId, {
        substance: doseToEdit?.substance || 'Kratom',
        amount: payload.amount,
        doseUnit: payload.unit,
        date: normalizedDate,
        notes: payload.notes || '',
        method: payload.method || '',
      });

      navigation.navigate('Daily');
      return;
    }

    await addDose({
      substance: 'Kratom',
      amount: payload.amount,
      doseUnit: payload.unit,
      date: normalizedDate,
      notes: payload.notes || '',
      method: payload.method || '',
    });

    navigation.navigate('Daily');
  };

  if (mode === 'edit' && !doseToEdit) {
    return (
      <View
        style={[
          styles.missingState,
          {
            backgroundColor: tokens.colors.surface,
            padding: tokens.spacing[16],
            gap: tokens.spacing[12],
          },
        ]}
      >
        <Text style={{ color: tokens.colors.onSurface, textAlign: 'center' }}>
          We couldn&apos;t find that dose to edit.
        </Text>
        <Text
          onPress={handleCancel}
          style={{
            color: tokens.colors.primary[500],
            textAlign: 'center',
            textDecorationLine: 'underline',
          }}
        >
          Go back to timeline
        </Text>
      </View>
    );
  }

  const initialAmount = doseToEdit
    ? normalizeDoseAmountForEntry(doseToEdit.amount, doseToEdit.doseUnit)
    : 0;

  const initialUnit = doseToEdit
    ? normalizeDoseUnitForEntry(doseToEdit.doseUnit)
    : 'g';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          padding: tokens.spacing[16],
        },
      ]}
    >
      <QuickDoseEntry
        mode={mode}
        initialAmount={initialAmount}
        initialUnit={initialUnit}
        initialTimestamp={toEntryTimestampDate(doseToEdit?.date)}
        initialNotes={doseToEdit?.notes || ''}
        initialMethod={doseToEdit?.method || ''}
        onSubmit={handleSubmit}
        onCancel={mode === 'edit' ? handleCancel : undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  missingState: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default DosePage;
