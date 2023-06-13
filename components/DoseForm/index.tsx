import React, { useState } from 'react';
import { View } from 'react-native';
import { TextInput, Button, Menu } from 'react-native-paper';

export const DoseForm = () => {
  const [amount, setAmount] = useState('0');
  const [unit, setUnit] = useState('gram');
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleAmountChange = (value) => {
    // Restrict input to floating point number with 1 significant digit
    const regex = /^[0-9]*\.?[0-9]?$/;
    if (regex.test(value)) {
      setAmount(value);
    }
  };

  const handleSubmit = () => {
    // Handle form submission
    console.log(`Submitted amount: ${amount} ${unit}`);
  };

  return (
      <View>
        <TextInput
          label='Amount'
          value={amount}
          onChangeText={handleAmountChange}
          keyboardType='numeric'
        />
        <Menu
          visible={visible}
          onDismiss={closeMenu}
          anchor={<Button onPress={openMenu}>{unit}</Button>}
        >
          <Menu.Item onPress={() => {setUnit('gram'); closeMenu();}} title='Gram' />
          <Menu.Item onPress={() => {setUnit('ounce'); closeMenu();}} title='Ounce' />
        </Menu>
        <Button onPress={handleSubmit}>Submit</Button>
      </View>
  );
};
