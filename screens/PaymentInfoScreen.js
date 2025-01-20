import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Alert, ScrollView} from 'react-native';
import {TextInput, Button, HelperText, useTheme} from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // For accessing stored data
import { BASE_URL, token } from '../Api/apiConfig';


const PaymentInfoScreen = ({navigation}) => {
  const theme = useTheme();
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState(''); 
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    const upiRegex = /^[\w.\-]+@[a-zA-Z]+$/;
    const cardRegex = /^\d{16}$/;
    const cvvRegex = /^\d{3,4}$/;

    if (!upiRegex.test(upiId)) newErrors.upiId = 'Invalid UPI ID format.';
    if (!cardRegex.test(cardNumber))
      newErrors.cardNumber = 'Card number must be 16 digits.';
    if (new Date(expiryDate) <= new Date())
      newErrors.expiryDate = 'Expiry date must be in the future.';
    if (!cvvRegex.test(cvv)) newErrors.cvv = 'CVV must be 3 or 4 digits.';
    if (!cardholderName.trim())
      newErrors.cardholderName = 'Cardholder name cannot be empty.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Failed', 'Please correct the errors.');
      return;
    }
    const token = await AsyncStorage.getItem('authToken');
    const userId = await AsyncStorage.getItem('userId');
console.log(userId,'userId');

    try {
      const payload = {
        userId,
        upiId,
        cardInfo: {
          cardNumber,
          expiryDate,
          cvv,
          cardholderName,
        },
      };

      console.log(payload);
      

      const response = await axios.post(
        `${BASE_URL}/payment/payment-info`, 
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log(response);

      if (response.status === 200) {
        Alert.alert('Success', 'Payment information saved successfully.');
        navigation.navigate('TransactionHistory');
      } else {
        Alert.alert('Error', 'Failed to save payment information.');
      }
    } catch (error) {
      console.error('Error saving payment info:', error);
      Alert.alert(
        'Error',
        'An error occurred while saving the payment information.',
      );
    }
  };

  const handleClear = () => {
    setUpiId('');
    setCardNumber('');
    setExpiryDate('');
    setCvv('');
    setCardholderName('');
    setErrors({});
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput
        label="UPI ID"
        value={upiId}
        onChangeText={setUpiId}
        mode="outlined"
        error={!!errors.upiId}
      />
      <HelperText type="error" visible={!!errors.upiId}>
        {errors.upiId}
      </HelperText>

      <TextInput
        label="Card Number"
        value={cardNumber}
        onChangeText={setCardNumber}
        keyboardType="numeric"
        mode="outlined"
        error={!!errors.cardNumber}
      />
      <HelperText type="error" visible={!!errors.cardNumber}>
        {errors.cardNumber}
      </HelperText>

      <TextInput
        label="Expiration Date (MM/YY)"
        value={expiryDate}
        onChangeText={setExpiryDate}
        placeholder="MM/YY"
        mode="outlined"
        error={!!errors.expiryDate}
      />
      <HelperText type="error" visible={!!errors.expiryDate}>
        {errors.expiryDate}
      </HelperText>

      <TextInput
        label="CVV"
        value={cvv}
        onChangeText={setCvv}
        keyboardType="numeric"
        mode="outlined"
        error={!!errors.cvv}
      />
      <HelperText type="error" visible={!!errors.cvv}>
        {errors.cvv}
      </HelperText>

      <TextInput
        label="Cardholder Name"
        value={cardholderName}
        onChangeText={setCardholderName}
        mode="outlined"
        error={!!errors.cardholderName}
      />
      <HelperText type="error" visible={!!errors.cardholderName}>
        {errors.cardholderName}
      </HelperText>

      <View style={styles.buttonContainer}>
        <Button mode="contained" onPress={handleSave} style={styles.button}>
          Save
        </Button>
        <Button mode="outlined" onPress={handleClear} style={styles.button}>
          Clear
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default PaymentInfoScreen;
