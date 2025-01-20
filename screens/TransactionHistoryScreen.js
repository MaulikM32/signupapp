import React, {useState, useEffect} from 'react';
import {View, StyleSheet, FlatList, Text, TouchableOpacity} from 'react-native';
import {ActivityIndicator, Card, Title, Paragraph} from 'react-native-paper';
import {apiCall} from '../Api/apiService';

const TransactionHistoryScreen = ({navigation}) => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTransactions = async () => {
    setIsLoading(true);
    setError('');
    const token = await AsyncStorage.getItem('authToken');
    try {
      const response = await apiCall({
        endpointKey: 'getTransaction',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(JSON.stringify(response.status), 'ppppppppp');

      if (response && response?.transactions) {
        setTransactions(response?.transactions);
      } else {
        setError('No transactions found.');
      }
    } catch (err) {
      setError('Failed to fetch transactions.. Please try again.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const formatDate = dateString => {
    const date = new Date(dateString);
    const options = {year: 'numeric', month: '2-digit', day: '2-digit'};
    return new Intl.DateTimeFormat('en-GB', options).format(date); // Formatting to dd-mm-yyyy
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

  return (
    <View style={styles.container}>
      {isLoading && transactions.length === 0 ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : transactions.length === 0 ? (
        <Text style={styles.emptyText}>No transactions found.</Text>
      ) : (
        <>
          <FlatList
            data={transactions}
            keyExtractor={item => item._id}
            renderItem={renderTransaction}
            contentContainerStyle={styles.listContent}
          />
          <TouchableOpacity
            style={{alignSelf: 'center', top: -100}}
            onPress={() => navigation.navigate('ItemsPage')}>
            <Text>Next page</Text>
          </TouchableOpacity>
        </>
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

export default TransactionHistoryScreen;
