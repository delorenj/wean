import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RadioButton, Button, useTheme } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import { useDoses, Dose } from '../../hooks/useDoses';
import { Timestamp } from "firebase/firestore";
import useDesignTokens from '../../hooks/useDesignTokens';

export const DoseForm = () => {

  let { addDose } = useDoses();
  const navigation = useNavigation();
  const tokens = useDesignTokens();
  const [dosage, setDosage] = useState(0);
  const [value, setValue] = useState('gram');

  useEffect(() => {
    if (!navigation) return;
    navigation.setOptions({ swipeEnabled: false });
  }, [navigation]);

  const handleAccept = () => {
    // Perform actions with the accepted value
    let dose: Dose = {
        substance: 'Kratom',
        amount: dosage,
        doseUnit: value,
        date: Timestamp.now()
    }
    addDose(dose);
    // @ts-ignore
    navigation.navigate("Daily");

  };

  return (
    <View style={[styles.container, { backgroundColor: tokens.colors.surface }]}>
      <View style={styles.radioContainer}>
        <RadioButton.Group onValueChange={(newValue) => setValue(newValue)} value={value}>
          <View style={styles.radio}>
            <RadioButton 
              color={tokens.colors.primary[300]} 
              uncheckedColor={tokens.colors.neutral[400]}
              value="gram" 
            />
            <Text style={[styles.radioText, { color: tokens.colors.onSurface }]}>Gram</Text>
          </View>

          <View style={styles.radio}>
            <RadioButton 
              color={tokens.colors.primary[300]} 
              uncheckedColor={tokens.colors.neutral[400]}
              value="ounce"
            />
            <Text style={[styles.radioText, { color: tokens.colors.onSurface }]}>Ounce</Text>
          </View>
        </RadioButton.Group>
      </View>
      <View style={styles.dosageDisplay}>
        <Text style={[styles.dosageText, { color: tokens.colors.primary[500] }]}>
          {dosage.toFixed(1)}
        </Text>
        <Text style={[styles.dosageUnit, { color: tokens.colors.onSurfaceVariant }]}>
          {value === 'gram' ? 'g' : 'oz'}
        </Text>
      </View>
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={20}
          step={0.5}
          minimumTrackTintColor={tokens.colors.primary[300]}
          maximumTrackTintColor={tokens.colors.neutral[200]}
          thumbTintColor={tokens.colors.primary[400]}
          onValueChange={(value) => setDosage(value)}
          value={dosage}
          accessibilityLabel="Dose amount slider"
          accessibilityHint={`Current dose: ${dosage.toFixed(1)} ${value}`}
        />
      </View>
      <Button 
        mode="contained" 
        onPress={handleAccept} 
        style={[styles.button, { backgroundColor: tokens.colors.primary[300] }]}
        accessibilityLabel="Save dose entry"
      >
        Accept
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  radio: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  radioText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  dosageDisplay: {
    alignItems: 'center',
    marginVertical: 40,
  },
  dosageText: {
    fontSize: 72,
    fontWeight: '600',
    textAlign: 'center',
  },
  dosageUnit: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 32,
    paddingHorizontal: 16,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  button: {
    borderRadius: 24,
    marginTop: 24,
  },
});
