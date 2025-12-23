import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import api from '../../config/api';

export default function BookTokenScreen({ route, navigation }) {
  const { service } = route.params;
  const [loading, setLoading] = useState(false);

  const handleBookToken = async () => {
    if (!service || !service._id) {
      Alert.alert('Error', 'Invalid service information');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/tokens/book', {
        serviceId: service._id
      });
      
      Alert.alert(
        'Success',
        `Token #${response.data.tokenNumber} booked successfully!`,
        [
          {
            text: 'View My Tokens',
            onPress: () => navigation.navigate('MyTokens')
          },
          { text: 'OK' }
        ]
      );
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to book token';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.serviceName}>{service.name}</Text>
        {service.description && (
          <Text style={styles.description}>{service.description}</Text>
        )}
        <Text style={styles.info}>
          Average Time: {service.averageTimePerToken} minutes per token
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={handleBookToken}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Book Token</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
    lineHeight: 22,
  },
  info: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 30,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

