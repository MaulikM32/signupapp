import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {apiCall} from '../Api/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SignInScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingAttachment, setLoadingAttachment] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '641485831523-m2irjkp22t55iqplj3tos21vpbfneecs.apps.googleusercontent.com',
      offlineAccess: true,
    });
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();
      setLoading(false);
      Alert.alert('Success', `Access Token: ${tokens.accessToken}`);
    } catch (error) {
      setLoading(false);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert('Sign-In Cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert('Sign-In In Progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Play Services Not Available');
      } else {
        Alert.alert('Error', error.message || 'An unknown error occurred');
      }
    }
  };

  const getToken = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return token || null;
    } catch (error) {
      console.error('Failed to retrieve token:', error);
      return null;
    }
  };

  useEffect(() => {
    getToken();
  }, []);

  const handleSign = async () => {
    if (!email || !firstName || !lastName || !password) {
      Alert.alert('Invalid Input', 'All fields are required.');
      return;
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      Alert.alert('Invalid Input', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const registerPayload = {
        email,
        firstName,
        lastName,
        password,
      };

      const registerResult = await apiCall({
        endpointKey: 'authRegister',
        method: 'POST',
        body: registerPayload,
      });

      if (registerResult?.success) {
        await handleSendOtp();
      } else {
        throw new Error(registerResult?.message || 'Registration failed.');
      }
    } catch (error) {
      console.error('Handle Sign Error:', error);
      Alert.alert('Error', 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    try {
      const otpPayload = {email};

      const otpResult = await apiCall({
        endpointKey: 'authRequestOtp',
        method: 'POST',
        body: otpPayload,
      });

      if (otpResult?.success) {
        setOtpSent(true);
        Alert.alert('OTP Sent', 'Please check your email for the OTP.');
      } else {
        throw new Error(otpResult?.message || 'Failed to send OTP.');
      }
    } catch (error) {
      console.error('Send OTP Error:', error);
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      Alert.alert('Invalid Input', 'Please enter the OTP.');
      return;
    }

    try {
      setLoading(true);

      const payload = {email, otp};
      const result = await apiCall({
        endpointKey: 'authVerifyOtp',
        method: 'POST',
        body: payload,
      });

      if (result?.success) {

        if (result.data.token && result.data._id) {
          await AsyncStorage.setItem('authToken', result.data.token);
          await AsyncStorage.setItem('userId', result.data._id);
        }
        Alert.alert('Success', 'OTP Verified.');
        navigation.navigate('Profile');
      } else {
        throw new Error(result?.message || 'Failed to verify OTP.');
      }
    } catch (error) {
      console.error('Verify OTP Error:', error);
      Alert.alert('Error', 'Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.header}>Sign Up / Sign In</Text>

        <TextInput
          style={styles.input}
          placeholder="First Name"
          placeholderTextColor="#999"
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          placeholderTextColor="#999"
          value={lastName}
          onChangeText={setLastName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {!otpSent ? (
          <>
            <TouchableOpacity
              style={styles.button}
              onPress={handleSign}
              disabled={loading || loadingAttachment}>
              {loading || loadingAttachment ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Send OTP</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="Enter OTP"
              placeholderTextColor="#999"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
            />
            <TouchableOpacity
              style={styles.button}
              onPress={handleVerifyOtp}
              disabled={loading || loadingAttachment}>
              {loading || loadingAttachment ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Verify OTP</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    color: '#000',
    marginBottom: 10,
  },
  orText: {
    textAlign: 'center',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  googleButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  googleButtonText: {
    color: 'black',
    fontSize: 16,
  },
});

export default SignInScreen;
