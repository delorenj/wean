import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RadioButton, Button } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import { useDoses, Dose } from '../../hooks/useDoses';
import { Timestamp } from "firebase/firestore";

export const DoseForm = () => {

  let { addDose } = useDoses();
  const navigation = useNavigation();
  const [dosage, setDosage] = useState(0);
  const [value, setValue] = useState('gram');

  const quickPresets = useMemo(() => {
    if (value === 'ounce') return [0.25, 0.5, 0.75, 1.0];
    return [0.5, 1.0, 1.5, 2.0, 3.0];
  }, [value]);

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
    <View style={styles.container}>
      <View style={styles.radioContainer}>
        <RadioButton.Group onValueChange={(newValue) => setValue(newValue)} value={value}>
          <View style={styles.radio}>
            <RadioButton color="white" uncheckedColor="white" value="gram" />
            <Text style={styles.radioText}>Gram</Text>
          </View>

          <View style={styles.radio}>
            <RadioButton color="white" uncheckedColor="white" value="ounce" />
            <Text style={styles.radioText}>Ounce</Text>
          </View>
        </RadioButton.Group>
      </View>
      <View style={styles.dosageText}>
        <Text style={styles.dosageText}>{dosage.toFixed(1)}</Text>
      </View>

      <View style={styles.quickEntryRow}>
        {quickPresets.map((preset) => (
          <Button
            key={`${value}-${preset}`}
            mode={dosage === preset ? 'contained' : 'outlined'}
            compact
            onPress={() => setDosage(preset)}
            style={styles.quickEntryButton}
            buttonColor={dosage === preset ? '#8E44AD' : undefined}
            textColor="white"
          >
            {`${preset}${value === 'gram' ? 'g' : 'oz'}`}
          </Button>
        ))}
      </View>

      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={20}
          step={0.5}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="#FFFFFF"
          thumbTintColor="#FF0000"
          onValueChange={(value) => setDosage(value)}
          value={dosage}
        />
      </View>
      <Button
        testID="quick-dose-save-button"
        mode="contained"
        onPress={handleAccept}
        style={styles.button}
        disabled={dosage <= 0}
      >
        Save Dose
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'black',
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  radio: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  radioText: {
    color: 'white',
    marginLeft: 5,
    fontSize: 24,
  },
  quickEntryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  quickEntryButton: {
    marginHorizontal: 4,
    marginVertical: 4,
    borderColor: '#8E44AD',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 80,
    paddingTop: 48,
  },
  slider: {
    flex: 1,
    marginRight: 10,
  },
  dosageText: {
    color: 'white',
    fontSize: 80,
    textAlign: 'center',
    marginTop: 20,
  },
  button: {
    borderRadius: 24,
    marginTop: 20,
  },
});
