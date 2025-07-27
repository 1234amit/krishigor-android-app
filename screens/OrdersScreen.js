import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URLS } from '../config/api';
import { handleNetworkError, retryRequest } from '../utils/networkUtils';

const OrdersScreen = ({ navigation, route }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { userId, phoneNumber, userData, token } = route.params || {};

  useEffect(() => {
    if (token) {
      fetchOrders();
    } else {
      Alert.alert('Error', 'Authentication token not found. Please login again.');
      navigation.navigate('Login');
    }
  }, [token]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('Fetching orders...');

      const response = await retryRequest(async () => {
        return axios.get(API_URLS.GET_ORDERS, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      });

      console.log('Orders API response:', response.data);

      const isSuccess = response.data.success || 
                       response.data.status === 'success' || 
                       response.status === 200;

      if (isSuccess) {
        const ordersData = response.data.data || response.data.orders || [];
        console.log('Fetched orders:', ordersData);
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      } else {
        console.log('Orders fetch response:', response.data);
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      const { errorMessage } = handleNetworkError(error, 'Fetching orders');
      Alert.alert('Error', errorMessage);
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '#FFA500';
      case 'confirmed':
        return '#4CAF50';
      case 'processing':
        return '#2196F3';
      case 'shipped':
        return '#9C27B0';
      case 'delivered':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      default:
        return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'time';
      case 'confirmed':
        return 'checkmark-circle';
      case 'processing':
        return 'settings';
      case 'shipped':
        return 'car';
      case 'delivered':
        return 'checkmark-done-circle';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const renderOrderItem = (order, index) => {
    const orderDate = new Date(order.createdAt || order.orderDate).toLocaleDateString();
    const status = order.status || 'pending';
    
    return (
      <TouchableOpacity
        key={index}
        style={styles.orderItem}
        onPress={() => {
          // Navigate to order details (you can create this screen later)
          Alert.alert('Order Details', `Order ID: ${order.orderId || order._id}\nStatus: ${status}\nTotal: ৳${order.total || order.orderInfo?.total || 0}`);
        }}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderId}>
              Order #{order.orderId || order._id?.slice(-8) || 'N/A'}
            </Text>
            <Text style={styles.orderDate}>{orderDate}</Text>
          </View>
          <View style={styles.statusContainer}>
            <Ionicons
              name={getStatusIcon(status)}
              size={16}
              color={getStatusColor(status)}
            />
            <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.orderDetails}>
          <Text style={styles.orderTotal}>
            Total: ৳{order.total || order.orderInfo?.total || 0}
          </Text>
          <Text style={styles.orderItems}>
            {order.orderInfo?.items?.length || order.items?.length || 0} items
          </Text>
        </View>

        <View style={styles.orderActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              // View order details
              Alert.alert('Order Details', `Order ID: ${order.orderId || order._id}\nStatus: ${status}\nTotal: ৳${order.total || order.orderInfo?.total || 0}`);
            }}
          >
            <Ionicons name="eye" size={16} color="#4CAF50" />
            <Text style={styles.actionButtonText}>View Details</Text>
          </TouchableOpacity>

          {status === 'pending' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => {
                Alert.alert(
                  'Cancel Order',
                  'Are you sure you want to cancel this order?',
                  [
                    { text: 'No', style: 'cancel' },
                    { 
                      text: 'Yes', 
                      style: 'destructive',
                      onPress: () => cancelOrder(order.orderId || order._id)
                    }
                  ]
                );
              }}
            >
              <Ionicons name="close" size={16} color="#F44336" />
              <Text style={[styles.actionButtonText, { color: '#F44336' }]}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const cancelOrder = async (orderId) => {
    try {
      console.log('Cancelling order:', orderId);

      const response = await axios.put(`${API_URLS.CANCEL_ORDER}/${orderId}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Cancel order response:', response.data);

      if (response.data.success || response.status === 200) {
        Alert.alert('Success', 'Order cancelled successfully');
        fetchOrders(); // Refresh orders
      } else {
        Alert.alert('Error', response.data.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      const { errorMessage } = handleNetworkError(error, 'Cancelling order');
      Alert.alert('Error', errorMessage);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={fetchOrders}
        >
          <Ionicons name="refresh" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
      >
        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySubtitle}>
              You haven't placed any orders yet. Start shopping to see your orders here.
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => navigation.navigate('Dashboard', {
                userId,
                phoneNumber,
                userData,
                token
              })}
            >
              <Text style={styles.browseButtonText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.ordersContainer}>
            {orders.map(renderOrderItem)}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 15,
    backgroundColor: '#4CAF50',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  refreshButton: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  browseButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  browseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ordersContainer: {
    padding: 20,
  },
  orderItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  orderItems: {
    fontSize: 14,
    color: '#666',
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f0f8f0',
  },
  cancelButton: {
    backgroundColor: '#fff0f0',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 5,
  },
});

export default OrdersScreen; 