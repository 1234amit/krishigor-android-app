import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URLS } from '../config/api';
import { handleNetworkError, retryRequest, showNetworkDiagnostics } from '../utils/networkUtils';

const { width } = Dimensions.get('window');

const CheckoutScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const { userId, phoneNumber, userData, token } = route.params || {};

  // Form state for checkout
  const [checkoutData, setCheckoutData] = useState({
    // Customer Information
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    
    // Shipping Information
    shippingAddress: '',
    shippingDivision: '',
    shippingDistrict: '',
    shippingUpazila: '',
    shippingPostCode: '',
    
    // Payment Information
    paymentMethod: 'cash_on_delivery', // Default to cash on delivery
    
    // Order Notes
    orderNotes: '',
  });

  useEffect(() => {
    if (token) {
      fetchUserProfile();
      fetchCartItems();
    } else {
      Alert.alert('Error', 'Authentication token not found. Please login again.');
      navigation.navigate('Login');
    }
  }, [token]);

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      console.log('Fetching user profile for checkout...');
      
      const response = await retryRequest(async () => {
        return axios.get(API_URLS.GET_PROFILE, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      });
      
      const isSuccess = response.data.success || 
                       response.data.status === 'success' || 
                       response.status === 200;
      
      if (isSuccess) {
        const profileData = response.data.data || response.data.user || response.data;
        console.log('Fetched profile data for checkout:', profileData);
        
        setUserProfile(profileData);
        
        // Auto-fill checkout form with user data
        setCheckoutData(prev => ({
          ...prev,
          customerName: profileData.name || profileData.fullName || '',
          customerPhone: profileData.phone || phoneNumber || '',
          customerEmail: profileData.email || '',
          shippingAddress: profileData.address || '',
          shippingDivision: profileData.division || '',
          shippingDistrict: profileData.district || '',
        }));
      } else {
        console.log('Profile fetch response:', response.data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      const { errorMessage } = handleNetworkError(error, 'Fetching user profile');
      Alert.alert('Error', errorMessage);
    }
  };

  // Fetch cart items for order summary
  const fetchCartItems = async () => {
    try {
      console.log('Fetching cart items for checkout...');
      
      const response = await axios.get(API_URLS.GET_CART, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Cart API response for checkout:', response.data);

      // Handle different possible response structures
      let items = [];
      if (response.data.success) {
        items = response.data.data || response.data.cartItems || response.data.items || [];
      } else if (response.data.data) {
        items = response.data.data;
      } else if (Array.isArray(response.data)) {
        items = response.data;
      } else if (response.status === 200) {
        items = response.data.data || response.data.cartItems || response.data.items || [];
      }

      console.log('Extracted cart items for checkout:', items);
      setCartItems(Array.isArray(items) ? items : []);
      
      // Calculate total
      const total = calculateCartTotal(items);
      setCartTotal(total);
      
    } catch (error) {
      console.error('Error fetching cart items:', error);
      const { errorMessage } = handleNetworkError(error, 'Fetching cart items');
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Calculate cart total
  const calculateCartTotal = (items) => {
    return items.reduce((total, item) => {
      let price = 0;
      
      if (item.product?.price) {
        price = item.product.price;
      } else if (item.productId?.price) {
        price = item.productId.price;
      } else if (item.price) {
        price = item.price;
      }
      
      price = parseFloat(price) || 0;
      let quantity = parseInt(item.quantity) || 1;
      
      return total + (price * quantity);
    }, 0);
  };

  // Calculate delivery fee
  const calculateDeliveryFee = () => {
    return cartTotal > 0 ? 60 : 0;
  };

  // Calculate final total
  const calculateFinalTotal = () => {
    return cartTotal + calculateDeliveryFee();
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setCheckoutData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Validate form
  const validateForm = () => {
    const requiredFields = [
      'customerName',
      'customerPhone',
      'shippingAddress',
      'shippingDivision',
      'shippingDistrict'
    ];

    for (const field of requiredFields) {
      if (!checkoutData[field] || checkoutData[field].trim() === '') {
        Alert.alert('Validation Error', `Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    if (cartItems.length === 0) {
      Alert.alert('Validation Error', 'Your cart is empty. Please add items before checkout.');
      return false;
    }

    return true;
  };

  // Place order
  const placeOrder = async () => {
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      console.log('Placing order with data:', checkoutData);
      console.log('Cart items:', cartItems);
      console.log('Total amount:', calculateFinalTotal());

      // Match backend controller (expects: items[], shippingAddress{}, paymentMethod, orderNotes, deliveryFee)
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.productId?._id || item.productId || item.product?._id || item.product?.id,
          quantity: Number(item.quantity) || 1,
        })),
        shippingAddress: {
          fullName: checkoutData.customerName,
          phoneNumber: checkoutData.customerPhone,
          address: checkoutData.shippingAddress,
          city: checkoutData.shippingDistrict,
          postalCode: checkoutData.shippingPostCode,
        },
        paymentMethod: checkoutData.paymentMethod,
        orderNotes: checkoutData.orderNotes,
        deliveryFee: calculateDeliveryFee(),
      };

      console.log('Sending order data:', orderData);

      console.log('CREATE_ORDER URL:', API_URLS.CREATE_ORDER);
      const response = await axios.post(API_URLS.CREATE_ORDER, orderData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Order placement response:', response.data);

      if (response.data.success || response.status === 201) {
        // Navigate to payment method flow; on success we can refresh cart in parent screens
        const createdOrderId = response.data.data?.orderId || response.data.orderId || response.data.data?._id;
        navigation.replace('PaymentMethod', {
          orderId: createdOrderId,
          token,
          userId,
          phoneNumber,
          userData,
          onPaymentSuccess: async () => {
            try {
              // Attempt to clear cart view state by re-fetch on next focus
              setCartItems([]);
            } catch {}
          }
        });
      } else {
        Alert.alert('Error', response.data.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      const { errorMessage } = handleNetworkError(error, 'Placing order');
      Alert.alert('Error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Render input field
  const renderInputField = (label, value, field, placeholder, keyboardType = 'default', multiline = false) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[
          styles.textInput,
          multiline && styles.multilineInput
        ]}
        value={value}
        onChangeText={(text) => handleInputChange(field, text)}
        placeholder={placeholder}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
    </View>
  );

  // Render order summary item
  const renderOrderItem = (item, index) => {
    const product = item.product || item.productId || item;
    const productName = product.productName || product.name || 'Product Name';
    const price = product.price || 0;
    const quantity = item.quantity || 1;
    const total = price * quantity;

    return (
      <View key={index} style={styles.orderItem}>
        <View style={styles.orderItemInfo}>
          <Text style={styles.orderItemName} numberOfLines={2}>
            {productName}
          </Text>
          <Text style={styles.orderItemQuantity}>Qty: {quantity}</Text>
        </View>
        <Text style={styles.orderItemPrice}>৳{total}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading checkout...</Text>
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
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Customer Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="person" size={20} color="#4CAF50" /> Customer Information
          </Text>
          {renderInputField('Full Name', checkoutData.customerName, 'customerName', 'Enter your full name')}
          {renderInputField('Phone Number', checkoutData.customerPhone, 'customerPhone', 'Enter your phone number', 'phone-pad')}
          {renderInputField('Email (Optional)', checkoutData.customerEmail, 'customerEmail', 'Enter your email address', 'email-address')}
        </View>

        {/* Shipping Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="location" size={20} color="#4CAF50" /> Shipping Information
          </Text>
          {renderInputField('Address', checkoutData.shippingAddress, 'shippingAddress', 'Enter your full address', 'default', true)}
          {renderInputField('Division', checkoutData.shippingDivision, 'shippingDivision', 'Enter your division')}
          {renderInputField('District', checkoutData.shippingDistrict, 'shippingDistrict', 'Enter your district')}
          {renderInputField('Upazila (Optional)', checkoutData.shippingUpazila, 'shippingUpazila', 'Enter your upazila')}
          {renderInputField('Post Code (Optional)', checkoutData.shippingPostCode, 'shippingPostCode', 'Enter your post code', 'numeric')}
        </View>

        {/* Payment Method Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="card" size={20} color="#4CAF50" /> Payment Method
          </Text>
          <View style={styles.paymentOptions}>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                checkoutData.paymentMethod === 'cash_on_delivery' && styles.paymentOptionSelected
              ]}
              onPress={() => handleInputChange('paymentMethod', 'cash_on_delivery')}
            >
              <Ionicons
                name={checkoutData.paymentMethod === 'cash_on_delivery' ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={checkoutData.paymentMethod === 'cash_on_delivery' ? '#4CAF50' : '#666'}
              />
              <Text style={[
                styles.paymentOptionText,
                checkoutData.paymentMethod === 'cash_on_delivery' && styles.paymentOptionTextSelected
              ]}>
                Cash on Delivery
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.paymentOption,
                checkoutData.paymentMethod === 'bkash' && styles.paymentOptionSelected
              ]}
              onPress={() => handleInputChange('paymentMethod', 'bkash')}
            >
              <Ionicons
                name={checkoutData.paymentMethod === 'bkash' ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={checkoutData.paymentMethod === 'bkash' ? '#4CAF50' : '#666'}
              />
              <Text style={[
                styles.paymentOptionText,
                checkoutData.paymentMethod === 'bkash' && styles.paymentOptionTextSelected
              ]}>
                bKash
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="document-text" size={20} color="#4CAF50" /> Order Notes (Optional)
          </Text>
          {renderInputField('', checkoutData.orderNotes, 'orderNotes', 'Add any special instructions or notes for your order', 'default', true)}
        </View>

        {/* Order Summary Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="list" size={20} color="#4CAF50" /> Order Summary
          </Text>
          <View style={styles.orderSummary}>
            {cartItems.map(renderOrderItem)}
            
            <View style={styles.summaryDivider} />
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>৳{cartTotal}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>৳{calculateDeliveryFee()}</Text>
            </View>
            
            <View style={styles.summaryDivider} />
            
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>৳{calculateFinalTotal()}</Text>
            </View>
          </View>
        </View> 
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.placeOrderButton, submitting && styles.placeOrderButtonDisabled]}
          onPress={placeOrder}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.placeOrderButtonText}>
              Place Order - ৳{calculateFinalTotal()}
            </Text>
          )}
        </TouchableOpacity>
      </View>
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
  headerSpacer: {
    width: 34, // Same width as back button for centering
  },
  scrollView: {
    flex: 1,
    paddingBottom: 100, // Space for bottom button
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
  section: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  paymentOptions: {
    gap: 10,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  paymentOptionSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#f0f8f0',
  },
  paymentOptionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  paymentOptionTextSelected: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  orderSummary: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  orderItemInfo: {
    flex: 1,
    marginRight: 10,
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  orderItemQuantity: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  placeOrderButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  placeOrderButtonDisabled: {
    backgroundColor: '#ccc',
  },
  placeOrderButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CheckoutScreen; 