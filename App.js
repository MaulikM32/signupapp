import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import SignInScreen from './screens/SignInScreen';
import ProfileScreen from './screens/ProfileScreen';
import PaymentInfoScreen from './screens/PaymentInfoScreen';
import TransactionHistoryScreen from './screens/TransactionHistoryScreen';
import ItemsPage from './screens/ItemsPage';
import FavoritesListScreen from './screens/FavoritesListScreen';
import ContactUsScreen from './screens/ContactUsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="SignIn">
        <Stack.Screen
          name="SignIn"
          component={SignInScreen}
          options={{title: 'Sign In / Sign Up'}}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{title: 'Profile'}}
        />

        <Stack.Screen
          name="PaymentInfo"
          component={PaymentInfoScreen}
          options={{title: 'Payment Information'}}
        />
        <Stack.Screen
          name="TransactionHistory"
          component={TransactionHistoryScreen}
          options={{title: 'Transaction History'}}
        />
        <Stack.Screen
          name="ItemsPage"
          component={ItemsPage}
          options={{title: 'Items'}}
        />
        <Stack.Screen
          name="FavoritesList"
          component={FavoritesListScreen}
          options={{title: 'Favorites'}}
        />
        <Stack.Screen
          name="ContactUsScreen"
          component={ContactUsScreen}
          options={{title: 'ContectUs'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
