import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RadioButton, Button } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import { useDoses, Dose } from '../../hooks/useDoses';
export const DoseForm = () => {

  let { addDose } = useDoses();
  const navigation = useNavigation();
  const [dosage, setDosage] = useState(0);
  const [value, setValue] = useState('gram');

  useEffect(() => {
    console.log('DoseForm useEffect');
    if (!navigation) return;
    console.log('DoseForm useEffect navigation');
    navigation.setOptions({ swipeEnabled: false });
  }, [navigation]);

  const handleAccept = () => {
    // Perform actions with the accepted value
    let dose: Dose = {
        substance: 'Kratom',
        amount: dosage,
        doseUnit: value,
    }
    addDose(dose);
    navigation.navigate('Daily');

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
      <Button mode="contained" onPress={handleAccept} style={styles.button}>
        Accept
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
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 200,
    paddingTop: 200,
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
