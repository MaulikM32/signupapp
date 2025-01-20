import AsyncStorage from '@react-native-async-storage/async-storage';
import {BASE_URL, ENDPOINTS} from './apiConfig';

const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    return token || null;
  } catch (error) {
    console.error('Failed to retrieve token:', error);
    return null;
  }
};

export const apiCall = async ({
  endpointKey,
  method = 'GET',
  body = null,
  headers = {},
}) => {
  try {
    const endpoint = ENDPOINTS[endpointKey];
    if (!endpoint) {
      throw new Error(
        `Endpoint "${endpointKey}" not found in API configuration.`,
      );
    }

    // Define the endpoints that do not require the Authorization header
    const noAuthEndpoints = [
      ENDPOINTS.authRegister,
      ENDPOINTS.authRequestOtp,
      ENDPOINTS.authVerifyOtp,
    ];

    // Fetch the token only if the endpoint requires it
    let token = null;
    console.log('Request URL:', `${BASE_URL}${endpoint}`);
    if (!noAuthEndpoints.includes(endpoint)) {
      token = await getToken();
      if (!token) {
        throw new Error('No authorization token found. Please log in.');
      }
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        ...(token &&
          !noAuthEndpoints.includes(endpoint) && {
            Authorization: `Bearer ${token}`,
          }),
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : null,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error(`API Error: ${error.message}`);
    throw error;
  }
};
