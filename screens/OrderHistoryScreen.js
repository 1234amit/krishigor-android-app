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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URLS } from '../config/api';
import { handleNetworkError, retryRequest } from '../utils/networkUtils';

const OrderHistoryScreen = ({ navigation, route }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, delivered, cancelled
  const { userId, phoneNumber, userData, token } = route.params || {};

  useEffect(() => {
    if (token) {
      fetchUserOrders();
    } else {
      Alert.alert('Error', 'Authentication token not found. Please login again.');
      navigation.navigate('Login');
    }
  }, [token]);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      console.log('Fetching order history for user with token');

      const response = await retryRequest(async () => {
        return axios.get(API_URLS.GET_ORDERS, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
          // Backend gets userId from JWT token, no need to send it
        });
      });

      console.log('Order History API response:', response.data);

      const isSuccess = response.data.success || 
                       response.data.status === 'success' || 
                       response.status === 200;

      if (isSuccess) {
        // Extract orders from the nested data structure
        const ordersData = response.data.data?.orders || response.data.orders || [];
        
        // Ensure ordersData is an array
        if (!Array.isArray(ordersData)) {
          ordersData = [];
        }

        console.log('Orders data received:', ordersData);
        setOrders(ordersData);
      } else {
        console.log('Order history fetch response:', response.data);
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching order history:', error);
      const { errorMessage } = handleNetworkError(error, 'Fetching order history');
      Alert.alert('Error', errorMessage);
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserOrders();
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
      case 'completed':
        return '#4CAF50';
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
      case 'completed':
        return 'checkmark-done-circle';
      default:
        return 'help-circle';
    }
  };

  const getFilteredOrders = () => {
    if (filter === 'all') return orders;
    return orders.filter(order => 
      (order.orderStatus || '').toLowerCase() === filter.toLowerCase()
    );
  };

  const renderOrderItem = (order, index) => {
    const orderDate = new Date(order.createdAt || order.orderDate || order.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    const status = order.orderStatus || order.status || 'pending';
    const orderId = order.orderId || order._id || order.id || `ORDER-${index + 1}`;
    const total = order.totalAmount || order.total || order.orderInfo?.total || order.amount || 0;
    const itemsCount = order.totalItems || order.orderInfo?.items?.length || order.items?.length || order.products?.length || 0;
    
    return (
      <TouchableOpacity
        key={index}
        style={styles.orderItem}
        onPress={() => {
          // Show order details in alert (can be expanded to full screen later)
          Alert.alert('Order Details', 
            `Order ID: ${orderId}\n` +
            `Date: ${orderDate}\n` +
            `Status: ${status.charAt(0).toUpperCase() + status.slice(1)}\n` +
            `Total: ৳${total}\n` +
            `Items: ${itemsCount}`
          );
        }}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderId}>
              Order #{typeof orderId === 'string' && orderId.length > 8 ? orderId.slice(-8) : orderId}
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
            Total: ৳{total}
          </Text>
          <Text style={styles.orderItems}>
            {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
          </Text>
        </View>

        {/* Show order items if available */}
        {order.items && order.items.length > 0 && (
          <View style={styles.orderItemsList}>
            {order.items.slice(0, 3).map((item, itemIndex) => (
              <View key={itemIndex} style={styles.orderItemRow}>
                {item.productImage && (
                  <Image 
                    source={{ uri: item.productImage }} 
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                )}
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.productName || item.name || 'Product'}
                  </Text>
                  <Text style={styles.itemQuantity}>
                    Quantity: {item.quantity || 1}
                  </Text>
                  <Text style={styles.itemPrice}>
                    ৳{item.price || item.product?.price || 0}
                  </Text>
                </View>
              </View>
            ))}
            {order.items.length > 3 && (
              <Text style={styles.moreItems}>... and {order.items.length - 3} more items</Text>
            )}
          </View>
        )}

        <View style={styles.orderActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              Alert.alert('Order Details', 
                `Order ID: ${orderId}\n` +
                `Date: ${orderDate}\n` +
                `Status: ${status.charAt(0).toUpperCase() + status.slice(1)}\n` +
                `Total: ৳${total}\n` +
                `Items: ${itemsCount}`
              );
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
                      onPress: () => cancelOrder(orderId)
                    }
                  ]
                );
              }}
            >
              <Ionicons name="close" size={16} color="#F44336" />
              <Text style={[styles.actionButtonText, { color: '#F44336' }]}>Cancel</Text>
            </TouchableOpacity>
          )}

          {status === 'delivered' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.reviewButton]}
              onPress={() => {
                Alert.alert('Review Order', 'Would you like to review this order?', [
                  { text: 'Later', style: 'cancel' },
                  { text: 'Review Now', onPress: () => navigateToReview(orderId) }
                ]);
              }}
            >
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={[styles.actionButtonText, { color: '#FFD700' }]}>Review</Text>
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
        fetchUserOrders(); // Refresh orders
      } else {
        Alert.alert('Error', response.data.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      const { errorMessage } = handleNetworkError(error, 'Cancelling order');
      Alert.alert('Error', errorMessage);
    }
  };

  const navigateToReview = (orderId) => {
    // Navigate to review screen (you can implement this later)
    Alert.alert('Review', `Review functionality for order ${orderId} will be implemented soon.`);
  };

  const renderFilterTabs = () => {
    const filters = [
      { key: 'all', label: 'All Orders', count: orders.length },
      { key: 'pending', label: 'Pending', count: orders.filter(o => (o.orderStatus || '').toLowerCase() === 'pending').length },
      { key: 'confirmed', label: 'Confirmed', count: orders.filter(o => (o.orderStatus || '').toLowerCase() === 'confirmed').length },
      { key: 'delivered', label: 'Delivered', count: orders.filter(o => (o.orderStatus || '').toLowerCase() === 'delivered').length },
      { key: 'cancelled', label: 'Cancelled', count: orders.filter(o => (o.orderStatus || '').toLowerCase() === 'cancelled').length },
    ];

    return (
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((filterItem) => (
            <TouchableOpacity
              key={filterItem.key}
              style={[
                styles.filterTab,
                filter === filterItem.key && styles.activeFilterTab
              ]}
              onPress={() => setFilter(filterItem.key)}
            >
              <Text style={[
                styles.filterTabText,
                filter === filterItem.key && styles.activeFilterTabText
              ]}>
                {filterItem.label} ({filterItem.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading your order history...</Text>
      </View>
    );
  }

  const filteredOrders = getFilteredOrders();

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
        <Text style={styles.headerTitle}>Order History</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={fetchUserOrders}
        >
          <Ionicons name="refresh" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      {orders.length > 0 && renderFilterTabs()}

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
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            {orders.length === 0 ? (
              <>
                <Ionicons name="receipt-outline" size={80} color="#ccc" />
                <Text style={styles.emptyTitle}>No orders yet</Text>
                <Text style={styles.emptySubtitle}>
                  You haven't placed any orders yet. Start shopping to see your order history here.
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
              </>
            ) : (
              <>
                <Ionicons name="filter-outline" size={80} color="#ccc" />
                <Text style={styles.emptyTitle}>No {filter} orders</Text>
                <Text style={styles.emptySubtitle}>
                  You don't have any {filter} orders at the moment.
                </Text>
                <TouchableOpacity
                  style={styles.browseButton}
                  onPress={() => setFilter('all')}
                >
                  <Text style={styles.browseButtonText}>View All Orders</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        ) : (
          <View style={styles.ordersContainer}>
            {filteredOrders.map(renderOrderItem)}
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
  filterContainer: {
    backgroundColor: 'white',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeFilterTab: {
    backgroundColor: '#4CAF50',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeFilterTabText: {
    color: 'white',
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
  orderItemsList: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  productImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  moreItems: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 5,
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
  reviewButton: {
    backgroundColor: '#fffbf0',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 5,
  },
});

export default OrderHistoryScreen;
