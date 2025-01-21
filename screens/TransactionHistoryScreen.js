import React, {useState, useEffect} from 'react';
import {View, StyleSheet, FlatList, Text, TouchableOpacity} from 'react-native';
import {ActivityIndicator, Card, Title, Paragraph} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {apiCall} from '../Api/apiService';

const TransactionHistoryScreen = ({navigation}) => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTransactions = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await apiCall({
        endpointKey: 'getTransaction',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response && response.transactions) {
        setTransactions(response.transactions);
      } else {
        setError('No transactions found.');
      }
    } catch (err) {
      setError('Failed to fetch transactions. Please try again.');
      console.error('Error fetching transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const renderTransaction = ({item}) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>To: {item.toUser}</Title>
        <Paragraph>Amount: ₹{item.amount.toFixed(2)}</Paragraph>
        <Paragraph>Date: {formatDate(item.date)}</Paragraph>
        <Paragraph>
          Payment Method: {item.paymentMethod.type} ({item.paymentMethod.id})
        </Paragraph>
      </Card.Content>
    </Card>
  );

  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" style={styles.loader} />;
    }

    if (error) {
      return <Text style={styles.errorText}>{error}</Text>;
    }

    if (transactions.length === 0) {
      return <Text style={styles.emptyText}>No transactions found.</Text>;
    }

    return (
      <FlatList
        data={transactions}
        keyExtractor={item => item._id}
        renderItem={renderTransaction}
        contentContainerStyle={styles.listContent}
      />
    );
  };

  return (
    <View style={styles.container}>
      {renderContent()}
      <TouchableOpacity
        
        onPress={() => navigation.navigate('ItemsPage')}>
        <Text style={{color:'#000', alignSelf:'center',paddingBottom:50}}>Next page</Text>
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingBottom: 60, 
  },
  card: {
    marginBottom: 10,
    backgroundColor: 'white',
  },
  nextButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TransactionHistoryScreen;
