import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  RefreshControl
} from 'react-native';
import api from '../../config/api';

export default function AdminServicesScreen({ navigation }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    averageTimePerToken: '5',
    isActive: true
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await api.get('/admin/services');
      setServices(response.data);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadServices();
  };

  const openModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description || '',
        averageTimePerToken: service.averageTimePerToken.toString(),
        isActive: service.isActive
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        description: '',
        averageTimePerToken: '5',
        isActive: true
      });
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Service name is required');
      return;
    }

    try {
      if (editingService) {
        await api.put(`/admin/services/${editingService._id}`, {
          ...formData,
          averageTimePerToken: parseInt(formData.averageTimePerToken)
        });
        Alert.alert('Success', 'Service updated successfully');
      } else {
        await api.post('/admin/services', {
          ...formData,
          averageTimePerToken: parseInt(formData.averageTimePerToken)
        });
        Alert.alert('Success', 'Service created successfully');
      }
      setModalVisible(false);
      loadServices();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save service');
    }
  };

  const renderService = ({ item }) => (
    <View style={styles.serviceCard}>
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{item.name}</Text>
        {item.description && (
          <Text style={styles.serviceDescription}>{item.description}</Text>
        )}
        <Text style={styles.serviceTime}>
          Avg. Time: {item.averageTimePerToken} min/token
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: item.isActive ? '#34C759' : '#FF3B30' }]}>
          <Text style={styles.statusText}>{item.isActive ? 'Active' : 'Inactive'}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => openModal(item)}
      >
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Manage Services</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={services}
        renderItem={renderService}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingService ? 'Edit Service' : 'Create Service'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Service Name *"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              numberOfLines={3}
            />

            <TextInput
              style={styles.input}
              placeholder="Average Time (minutes)"
              value={formData.averageTimePerToken}
              onChangeText={(text) => setFormData({ ...formData, averageTimePerToken: text })}
              keyboardType="numeric"
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    padding: 15,
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  serviceTime: {
    fontSize: 12,
    color: '#007AFF',
    marginBottom: 5,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 5,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

