import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import { BASE_URL } from '../Api/apiConfig';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FavoritesListScreen = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchFavorites = async () => {
    const token = await AsyncStorage.getItem('authToken');
    setError('');
    try {
      const response = await axios.get(`${BASE_URL}/favourites`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      setFavorites(response.data?.favourites || []);
    } catch (err) {
      setError('Failed to fetch favorites. Please try again.');
      console.error('Error fetching favorites:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchFavorites();
  }, []);

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{item.name}</Title>
        <Paragraph>{item.description}</Paragraph>
        <Paragraph>Price: ₹{item.price.toFixed(2)}</Paragraph>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : favorites.length === 0 ? (
        <Text style={styles.emptyText}>
          You haven't selected any favorites yet.
        </Text>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
      <TouchableOpacity
        style={{ alignSelf: 'center', top: -100 }}
        onPress={() => navigation.navigate('ContactUsScreen')}
      >
        <Text style={{ fontSize: 14, color: '#000' }}>Contact Us</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  loader: {
    marginTop: 20,
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    fontSize: 16,
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
    marginTop: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    marginBottom: 10,
    backgroundColor: 'white',
  },
});

export default FavoritesListScreen;