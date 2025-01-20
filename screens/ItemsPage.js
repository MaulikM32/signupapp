import React, {useState, useEffect} from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {IconButton, Card, Title, Paragraph, Button} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {apiCall} from '../Api/apiService';

const ItemsPage = ({navigation}) => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchItems = async () => {
    console.log('llllll');
    
    setIsLoading(true);
    setError('');
    try {
      const response = await apiCall({
        endpointKey: 'itemsSearch',
        method: 'GET',
      });
      await AsyncStorage.setItem('itemsData', JSON.stringify(response));
      setItems(response);
      setFilteredItems(response);
    } catch (err) {
      setError('Failed to load items.');
      console.error('Error fetching items:', err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('itemsData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setItems(parsedData);
          setFilteredItems(parsedData);
        } else {
          fetchItems();
        }
      } catch (err) {
        console.error('Error loading data from AsyncStorage:', err);
      }
    };

    loadData();
  }, []);

  const handleSearch = query => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredItems(items);
    } else {
      const filtered = items.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase()),
      );
      setFilteredItems(filtered);
      if (filtered.length === 0) {
        setError('No items found.');
      } else {
        setError('');
      }
    }
  };

  const renderItem = ({item}) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{item.name}</Title>
        <Paragraph>Price: ₹{item.price}</Paragraph>
        <Paragraph>Category: {item.category}</Paragraph>
        <Paragraph>{item.description}</Paragraph>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search items..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <IconButton
          icon="magnify"
          size={30}
          onPress={() => handleSearch(searchQuery)}
          style={styles.searchIcon}
        />
      </View>

      <Button
        mode="contained"
        onPress={() => navigation.navigate('FavoritesList')}
        style={styles.navButton}>
        Go to Favorites
      </Button>

      {isLoading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  searchBarContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 10,
    alignItems: 'center',
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  searchIcon: {
    marginHorizontal: 5,
  },
  navButton: {
    marginBottom: 10,
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
  listContent: {
    paddingBottom: 20,
  },
  card: {
    marginBottom: 10,
    backgroundColor: 'white',
  },
});

export default ItemsPage;
