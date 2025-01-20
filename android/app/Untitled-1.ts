    // try {
    //   await GoogleSignin.hasPlayServices();
    //   const userInfo = await GoogleSignin.signIn();
    //   const token = await GoogleSignin.getTokens(); 
    //   Alert.alert('Success', `Welcome ${userInfo.user.name}`);


    //   fetch('https://your-api-endpoint.com', {
    //     method: 'GET',
    //     headers: {
    //       Authorization: `Bearer ${token.accessToken}`, 
    //     },
    //   })
    //     .then(response => response.json())
    //     .then(data => {
    //       console.log('API Response:', data);
    //       Alert.alert('API Success', JSON.stringify(data));
    //     })
    //     .catch(error => {
    //       console.error('API Error:', error);
    //       Alert.alert('API Error', 'Something went wrong while calling the API.');
    //     });
    // } catch (error) {
    //   const errorMessage =
    //     error.code === statusCodes.SIGN_IN_CANCELLED
    //       ? 'Google Sign-In was cancelled.'
    //       : error.code === statusCodes.IN_PROGRESS
    //       ? 'Google Sign-In is in progress.'
    //       : error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE
    //       ? 'Google Play Services are not available.'
    //       : error.message;
    //   Alert.alert('Error', errorMessage);
    // }