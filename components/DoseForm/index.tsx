import React, { useEffect, useState } from 'react';
import {View, Text, StyleSheet, Platform, ScrollView} from 'react-native';
import { RadioButton, Button } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import { useDoses, Dose } from '../../hooks/useDoses';
import { Timestamp } from "firebase/firestore";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export const DoseForm = () => {
  let { addDose } = useDoses();
  const navigation = useNavigation();
  const [dosage, setDosage] = useState(0);
  const [value, setValue] = useState('gram');
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!navigation) return;
    navigation.setOptions({ swipeEnabled: false });
  }, [navigation]);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const showDatepicker = () => {
    setShow(true);
  };

  const handleAccept = () => {
    // Perform actions with the accepted value
    let dose: Dose = {
      substance: 'Kratom',
      amount: dosage,
      doseUnit: value,
      date: Timestamp.fromDate(date) // Use the selected date
    }
    addDose(dose);
    // @ts-ignore
    navigation.navigate("Daily");
  };

  return (
    <ScrollView style={[styles.container, { paddingBottom: insets.bottom + 200 }]}>
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
        <Slider style={styles.slider} minimumValue={0} maximumValue={20} step={0.5} minimumTrackTintColor="#FFFFFF" maximumTrackTintColor="#FFFFFF" thumbTintColor="#FF0000" onValueChange={(value) => setDosage(value)} value={dosage} />
      </View>
      <Button mode="contained" onPress={showDatepicker} style={styles.button}>
        Set Date
      </Button>
      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode={'date'}
          is24Hour={true}
          display="default"
          onChange={onChange}
        />
      )}
      <Button mode="contained" onPress={handleAccept} style={styles.button}>
        Save
      </Button>
    </ScrollView>
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
