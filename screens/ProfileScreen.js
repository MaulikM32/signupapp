import React, {useState, useEffect} from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Button,
  Avatar,
  TextInput as PaperTextInput,
  Text,
} from 'react-native-paper';
import * as ImagePicker from 'react-native-image-picker';
import axios from 'axios';
import {apiCall} from '../Api/apiService';
import {BASE_URL} from '../Api/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
const ProfileScreen = ({navigation}) => {
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const response = await apiCall({
          endpointKey: 'getProfile',
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const {firstName, lastName, email, phone, profilePicture} = response;

        setProfileData({
          firstName,
          lastName,
          email,
          phone,
        });

        if (profilePicture) {
          setImage(profilePicture);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        Alert.alert('Error', 'Failed to load profile data.');
      }
    };

    fetchProfileData();
  }, []);

  const handleImageUpload = () => {
    ImagePicker.launchImageLibrary(
      {mediaType: 'photo', quality: 0.5},
      async response => {
        if (response.assets && response.assets[0].uri) {
          const selectedImageUri = response.assets[0].uri;
          const token = await AsyncStorage.getItem('authToken');
          const formData = new FormData();
          formData.append('image', {
            uri: selectedImageUri,
            type: 'image/jpeg',
            name: 'profile_image.jpg',
          });

          try {
            const uploadResponse = await axios.post(
              `${BASE_URL}/profile/upload-profile`,
              formData,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'multipart/form-data',
                },
              },
            );
            if (uploadResponse.status === 200 && uploadResponse) {
              setImage(selectedImageUri);
              Alert.alert('Success', 'Profile image uploaded successfully!');
            } else {
              console.warn('Upload failed with status:', uploadResponse.status);
              Alert.alert(
                'Error',
                'Failed to upload the image. Please try again.',
              );
            }
          } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert(
              'Error',
              'An error occurred while uploading the image. Please try again later.',
            );
          }
        }
      },
    );
  };

  const validateInputs = () => {
    const {email, phone, firstName, lastName} = profileData;

    if (!firstName.trim()) {
      Alert.alert('Invalid Input', 'First Name is required.');
      return false;
    }
    if (!lastName.trim()) {
      Alert.alert('Invalid Input', 'Last Name is required.');
      return false;
    }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      Alert.alert('Invalid Input', 'Please enter a valid email address.');
      return false;
    }
    if (!phone.match(/^\d{10}$/)) {
      Alert.alert(
        'Invalid Input',
        'Please enter a valid 10-digit phone number.',
      );
      return false;
    }
    return true;
  };

  const handleUpdate = async () => {
    setLoading(true);

    const {firstName, lastName, email, phone} = profileData;
    const token = await AsyncStorage.getItem('authToken');

    const formData = new FormData();
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    formData.append('email', email);
    formData.append('phone', phone);

    if (image) {
      formData.append('image', {
        uri: image,
        type: 'image/jpeg',
        name: 'profile_image.jpg',
      });
    }

    try {
      const response = await axios.put(
        `${BASE_URL}/profile/update-profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      if (response.status === 200) {
        setLoading(false);
        Alert.alert('Success', 'Profile updated successfully!');
        navigation.navigate('PaymentInfo');
      } else {
        setLoading(false);
        Alert.alert('Error', 'Failed to update the profile.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setLoading(false);
      Alert.alert('Error', 'An error occurred while updating the profile.');
    }
  };

  return (
    <KeyboardAvoidingView style={{flex: 1}} behavior="padding">
      <ScrollView contentContainerStyle={styles.container}>
        <Avatar.Image
          size={120}
          source={image ? {uri: image} : require('../image/1.jpg')}
          style={styles.avatar}
        />
        <TouchableOpacity
          onPress={handleImageUpload}
          style={styles.uploadButton}>
          <Text style={styles.uploadText}>Upload Profile Picture</Text>
        </TouchableOpacity>

        <PaperTextInput
          label="First Name"
          value={profileData.firstName}
          onChangeText={text =>
            setProfileData({...profileData, firstName: text})
          }
          style={styles.input}
          mode="outlined"
        />
        <PaperTextInput
          label="Last Name"
          value={profileData.lastName}
          onChangeText={text =>
            setProfileData({...profileData, lastName: text})
          }
          style={styles.input}
          mode="outlined"
        />
        <PaperTextInput
          label="Email"
          value={profileData.email}
          onChangeText={text => setProfileData({...profileData, email: text})}
          keyboardType="email-address"
          style={styles.input}
          mode="outlined"
        />
        <PaperTextInput
          label="Phone Number"
          value={profileData.phone}
          onChangeText={text => setProfileData({...profileData, phone: text})}
          keyboardType="phone-pad"
          style={styles.input}
          mode="outlined"
        />

        <Button
          mode="contained"
          onPress={handleUpdate}
          loading={loading}
          disabled={loading}
          style={styles.button}>
          {loading ? 'Updating...' : 'Update'}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  avatar: {
    marginBottom: 16,
  },
  uploadButton: {
    marginBottom: 16,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
  },
  uploadText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    marginBottom: 16,
  },
  button: {
    marginTop: 20,
    width: '100%',
    paddingVertical: 8,
  },
});

export default ProfileScreen;
