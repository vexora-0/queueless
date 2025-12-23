import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../config/api';
import ConfirmationModal from '../../components/ConfirmationModal';

export default function MyTokensScreen({ navigation }) {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [tokenToCancel, setTokenToCancel] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadTokens();
    }, [])
  );

  const loadTokens = async () => {
    try {
      const response = await api.get('/tokens/my-tokens');
      setTokens(response.data);
    } catch (error) {
      console.error('Error loading tokens:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTokens();
  };

  const handleCancelToken = (tokenId) => {
    if (!tokenId) {
      Alert.alert('Error', 'Invalid token ID');
      return;
    }

    setTokenToCancel(tokenId);
    setCancelModalVisible(true);
  };

  const confirmCancel = async () => {
    if (!tokenToCancel) return;

    try {
      await api.delete(`/tokens/cancel/${tokenToCancel}`);
      await loadTokens();
      setCancelModalVisible(false);
      setTokenToCancel(null);
      Alert.alert('Success', 'Token cancelled successfully');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to cancel token';
      Alert.alert('Error', errorMessage);
      setCancelModalVisible(false);
      setTokenToCancel(null);
    }
  };

  const cancelCancel = () => {
    setCancelModalVisible(false);
    setTokenToCancel(null);
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

  const renderToken = ({ item }) => {
    const handleCardPress = () => {
      navigation.navigate('TokenDetails', { token: item });
    };

    const handleCancelPress = () => {
      handleCancelToken(item._id);
    };

    return (
      <View style={styles.tokenCard}>
        <TouchableOpacity
          onPress={handleCardPress}
          activeOpacity={0.7}
          style={styles.cardContent}
        >
          <View style={styles.tokenHeader}>
            <Text style={styles.tokenNumber}>Token #{item.tokenNumber}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.serviceName}>{item.service?.name || 'Unknown Service'}</Text>
          {item.status === 'pending' && (
            <Text style={styles.waitTime}>
              Est. Wait: {item.estimatedWaitTime || 0} minutes
            </Text>
          )}
        </TouchableOpacity>
        {item.status === 'pending' && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelPress}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tokens}
        renderItem={renderToken}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No tokens found</Text>
            <Text style={styles.emptySubtext}>Book a token to get started</Text>
          </View>
        }
      />
      <ConfirmationModal
        visible={cancelModalVisible}
        title="Cancel Token"
        message="Are you sure you want to cancel this token?"
        confirmText="Yes"
        cancelText="No"
        onConfirm={confirmCancel}
        onCancel={cancelCancel}
        confirmButtonStyle="destructive"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 15,
  },
  tokenCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
  },
  tokenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tokenNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  serviceName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  waitTime: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginTop: 5,
  },
  cancelButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#FF3B30',
    borderRadius: 6,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});

