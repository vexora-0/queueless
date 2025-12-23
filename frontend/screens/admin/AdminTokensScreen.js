import React, { useState, useEffect } from 'react';
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
import api from '../../config/api';
import ConfirmationModal from '../../components/ConfirmationModal';

export default function AdminTokensScreen({ route }) {
  const { serviceId } = route.params || {};
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [skipModalVisible, setSkipModalVisible] = useState(false);
  const [tokenToSkip, setTokenToSkip] = useState(null);

  useEffect(() => {
    if (serviceId) {
      loadTokens();
    }
  }, [serviceId, filter]);

  const loadTokens = async () => {
    try {
      const status = filter === 'all' ? null : filter;
      const response = await api.get(`/admin/tokens/${serviceId}`, {
        params: status ? { status } : {}
      });
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

  const handleCallToken = async (tokenId) => {
    try {
      await api.post(`/admin/tokens/${tokenId}/call`);
      Alert.alert('Success', 'Token called successfully');
      loadTokens();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to call token');
    }
  };

  const handleCompleteToken = async (tokenId) => {
    try {
      await api.post(`/admin/tokens/${tokenId}/complete`);
      Alert.alert('Success', 'Token marked as completed');
      loadTokens();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to complete token');
    }
  };

  const handleSkipToken = (tokenId) => {
    if (!tokenId) {
      Alert.alert('Error', 'Invalid token ID');
      return;
    }

    setTokenToSkip(tokenId);
    setSkipModalVisible(true);
  };

  const confirmSkip = async () => {
    if (!tokenToSkip) return;

    try {
      await api.post(`/admin/tokens/${tokenToSkip}/skip`);
      Alert.alert('Success', 'Token skipped');
      await loadTokens();
      setSkipModalVisible(false);
      setTokenToSkip(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to skip token';
      Alert.alert('Error', errorMessage);
      setSkipModalVisible(false);
      setTokenToSkip(null);
    }
  };

  const cancelSkip = () => {
    setSkipModalVisible(false);
    setTokenToSkip(null);
  };

  const handleCallNext = async () => {
    try {
      const response = await api.post(`/admin/tokens/service/${serviceId}/call-next`);
      Alert.alert('Success', `Token #${response.data.tokenNumber} called successfully!`);
      loadTokens();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'No pending tokens available');
    }
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
    const handleCallPress = () => {
      handleCallToken(item._id);
    };

    const handleCompletePress = () => {
      handleCompleteToken(item._id);
    };

    const handleSkipPress = () => {
      handleSkipToken(item._id);
    };

    return (
      <View style={styles.tokenCard}>
        <View style={styles.tokenHeader}>
          <View>
            <Text style={styles.tokenNumber}>Token #{item.tokenNumber}</Text>
            <Text style={styles.userName}>{item.user?.name || 'Unknown'}</Text>
            <Text style={styles.userEmail}>{item.user?.email || 'Unknown'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          {item.status === 'pending' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.callButton]}
              onPress={handleCallPress}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonText}>Call</Text>
            </TouchableOpacity>
          )}
          {item.status === 'called' && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.completeButton]}
                onPress={handleCompletePress}
                activeOpacity={0.8}
              >
                <Text style={styles.actionButtonText}>Complete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.skipButton]}
                onPress={handleSkipPress}
                activeOpacity={0.8}
              >
                <Text style={styles.actionButtonText}>Skip</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
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

  if (!serviceId) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Please select a service from dashboard</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.callNextButton}
          onPress={handleCallNext}
        >
          <Text style={styles.callNextButtonText}>Call Next Token</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'pending' && styles.filterButtonActive]}
          onPress={() => setFilter('pending')}
        >
          <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>
            Pending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'called' && styles.filterButtonActive]}
          onPress={() => setFilter('called')}
        >
          <Text style={[styles.filterText, filter === 'called' && styles.filterTextActive]}>
            Called
          </Text>
        </TouchableOpacity>
      </View>

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
          </View>
        }
      />
      <ConfirmationModal
        visible={skipModalVisible}
        title="Skip Token"
        message="Are you sure you want to skip this token?"
        confirmText="Skip"
        cancelText="Cancel"
        onConfirm={confirmSkip}
        onCancel={cancelSkip}
        confirmButtonStyle="default"
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
  filterContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
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
  tokenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  tokenNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#999',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 10,
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  callButton: {
    backgroundColor: '#007AFF',
  },
  completeButton: {
    backgroundColor: '#34C759',
  },
  skipButton: {
    backgroundColor: '#FF9500',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
  },
  header: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  callNextButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  callNextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

