import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl
} from 'react-native';
import api from '../../config/api';

export default function TokenDetailsScreen({ route }) {
  const { token: initialToken } = route.params;
  const [token, setToken] = useState(initialToken);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (token.status === 'pending' || token.status === 'called') {
      const interval = setInterval(() => {
        loadTokenDetails();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [token._id]);

  const loadTokenDetails = async () => {
    try {
      const response = await api.get(`/tokens/my-tokens/${token.service._id}`);
      setToken(response.data);
    } catch (error) {
      console.error('Error loading token details:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTokenDetails();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FF9500';
      case 'called': return '#007AFF';
      case 'completed': return '#34C759';
      case 'cancelled': return '#FF3B30';
      case 'skipped': return '#8E8E93';
      default: return '#8E8E93';
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.tokenNumber}>Token #{token.tokenNumber}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(token.status) }]}>
            <Text style={styles.statusText}>{token.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Service</Text>
          <Text style={styles.value}>{token.service.name}</Text>
          {token.service.description && (
            <Text style={styles.description}>{token.service.description}</Text>
          )}
        </View>

        {token.status === 'pending' && (
          <View style={styles.section}>
            <Text style={styles.label}>Estimated Wait Time</Text>
            <Text style={styles.waitTime}>{token.estimatedWaitTime} minutes</Text>
          </View>
        )}

        {token.currentTokenNumber && (
          <View style={styles.section}>
            <Text style={styles.label}>Currently Serving</Text>
            <Text style={styles.value}>Token #{token.currentTokenNumber}</Text>
          </View>
        )}

        {token.status === 'called' && (
          <View style={styles.alertBox}>
            <Text style={styles.alertText}>Your token has been called! Please proceed.</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>Booked At</Text>
          <Text style={styles.value}>
            {new Date(token.createdAt).toLocaleString()}
          </Text>
        </View>

        {token.calledAt && (
          <View style={styles.section}>
            <Text style={styles.label}>Called At</Text>
            <Text style={styles.value}>
              {new Date(token.calledAt).toLocaleString()}
            </Text>
          </View>
        )}

        {token.completedAt && (
          <View style={styles.section}>
            <Text style={styles.label}>Completed At</Text>
            <Text style={styles.value}>
              {new Date(token.completedAt).toLocaleString()}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tokenNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#999',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  waitTime: {
    fontSize: 24,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  alertBox: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    marginVertical: 15,
  },
  alertText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

