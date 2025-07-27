import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URLS } from '../config/api';
import { handleNetworkError, retryRequest, showNetworkDiagnostics } from '../utils/networkUtils';

const { width } = Dimensions.get('window');

// Helper function to consistently extract productId from cart items
const extractProductId = (item) => {
  return item.productId?._id || item.productId || item.product?._id || item.product?.id || item._id || item.id;
};

const CartScreen = ({ navigation, route }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingQuantity, setUpdatingQuantity] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState('cart');
  const [lastUpdateTime, setLastUpdateTime] = useState(0);
  const { userId, phoneNumber, userData, token } = route.params || {};

  useEffect(() => {
    if (token) {
      fetchCartItems();
    } else {
      Alert.alert('Error', 'Authentication token not found. Please login again.');
      navigation.navigate('Login');
    }
  }, [token]);

  // Refresh cart items when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (token) {
        console.log('Cart screen focused, refreshing cart items...');
        // Only refresh if not currently updating quantity to avoid conflicts
        if (!updatingQuantity) {
          fetchCartItems();
        }
      }
    }, [token, updatingQuantity])
  );

  // Test API endpoint
  const testAPI = async () => {
    try {
      console.log('🔍 Testing API endpoint:', API_URLS.GET_CART);
      console.log('🔍 Current cart items in state:', cartItems);

      const response = await axios.get(API_URLS.GET_CART, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Test API response:', response.data);

      // Analyze the structure of cart items
      if (response.data.data || response.data.cartItems || response.data.items) {
        const items = response.data.data || response.data.cartItems || response.data.items || [];
        console.log('🔍 Cart items structure analysis:');
        items.forEach((item, index) => {
          console.log(`Item ${index}:`, {
            item: item,
            productId: item.productId,
            productId_id: item.productId?._id,
            productId_price: item.productId?.price,
            product: item.product,
            product_id: item.product?._id,
            product_price: item.product?.price,
            price: item.price,
            quantity: item.quantity,
            _id: item._id,
            id: item.id
          });
        });
      }
    } catch (error) {
      console.error('❌ Test API error:', error.response?.data || error.message);
    }
  };

  // Debug price calculation
  const debugPriceCalculation = () => {
    console.log('🔍 DEBUG: Price calculation analysis');
    console.log('🔍 Current cart items:', cartItems);
    
    cartItems.forEach((item, index) => {
      console.log(`🔍 Item ${index} analysis:`);
      console.log(`  - Raw item:`, item);
      console.log(`  - item.product?.price:`, item.product?.price);
      console.log(`  - item.productId?.price:`, item.productId?.price);
      console.log(`  - item.price:`, item.price);
      console.log(`  - item.quantity:`, item.quantity);
      console.log(`  - item.quantity type:`, typeof item.quantity);
      
      // Calculate what the function would calculate
      let price = 0;
      if (item.product?.price) {
        price = item.product.price;
      } else if (item.productId?.price) {
        price = item.productId.price;
      } else if (item.price) {
        price = item.price;
      }
      
      let quantity = item.quantity;
      if (typeof quantity === 'string') {
        quantity = parseInt(quantity, 10);
      }
      quantity = parseInt(quantity) || 1;
      
      console.log(`  - Calculated price:`, price);
      console.log(`  - Calculated quantity:`, quantity);
      console.log(`  - Item total:`, price * quantity);
    });
    
    const subtotal = calculateSubtotal();
    console.log(`🔍 Final subtotal:`, subtotal);
  };

  // Reset all quantities to 1 (emergency fix)
  const resetAllQuantities = async () => {
    try {
      console.log('🔧 Resetting all quantities to 1...');

      for (const item of cartItems) {
        const productId = extractProductId(item);
        console.log(`🔧 Resetting quantity for product ${productId} to 1`);

        await axios.post(API_URLS.ADD_TO_CART, {
          productId: productId,
          quantity: 1
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }

      // Refresh cart after reset
      await fetchCartItems();
      Alert.alert('Success', 'All quantities reset to 1');
    } catch (error) {
      console.error('❌ Error resetting quantities:', error);
      Alert.alert('Error', 'Failed to reset quantities');
    }
  };

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      console.log('Fetching cart items with token:', token);

      const response = await axios.get(API_URLS.GET_CART, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Cart API response:', response.data);
      console.log('Cart API response status:', response.status);
      console.log('Cart API response success field:', response.data.success);
      console.log('Cart API response data field:', response.data.data);
      console.log('Cart API response cartItems field:', response.data.cartItems);
      console.log('Cart API response items field:', response.data.items);

      // Handle different possible response structures
      let items = [];
      if (response.data.success) {
        items = response.data.data || response.data.cartItems || response.data.items || [];
      } else if (response.data.data) {
        items = response.data.data;
      } else if (Array.isArray(response.data)) {
        items = response.data;
      } else if (response.status === 200) {
        // If status is 200, try to extract items from response
        items = response.data.data || response.data.cartItems || response.data.items || [];
      }

      console.log('Extracted cart items:', items);
      console.log('Is items array?', Array.isArray(items));
      console.log('Items length:', items.length);

      // Log each item's quantity for debugging and fix unreasonable quantities
      if (Array.isArray(items)) {
        items.forEach((item, index) => {
          console.log(`📦 Item ${index} quantity:`, item.quantity, 'type:', typeof item.quantity);

          // Fix unreasonable quantities (likely backend issue)
          if (item.quantity > 100) {
            console.log(`🔧 Fixing unreasonable quantity for item ${index}: ${item.quantity} -> 1`);
            item.quantity = 1;
          }
        });
      }

      setCartItems(Array.isArray(items) ? items : []);
    } catch (error) {
      const { errorMessage, shouldRetry } = handleNetworkError(error, 'Fetching cart items');

      if (shouldRetry) {
        try {
          console.log('Retrying fetch cart items request...');
          const retryResponse = await retryRequest(async () => {
            return await axios.get(API_URLS.GET_CART, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
          });

          // Process retry response similar to original
          let items = [];
          if (retryResponse.data.success) {
            items = retryResponse.data.data || retryResponse.data.cartItems || retryResponse.data.items || [];
          } else if (retryResponse.data.data) {
            items = retryResponse.data.data;
          } else if (Array.isArray(retryResponse.data)) {
            items = retryResponse.data;
          } else if (retryResponse.status === 200) {
            items = retryResponse.data.data || retryResponse.data.cartItems || retryResponse.data.items || [];
          }

          console.log('Retry response items:', items);
          if (Array.isArray(items)) {
            items.forEach((item, index) => {
              console.log(`📦 Retry Item ${index} quantity:`, item.quantity, 'type:', typeof item.quantity);

              // Fix unreasonable quantities (likely backend issue)
              if (item.quantity > 100) {
                console.log(`🔧 Fixing unreasonable quantity for retry item ${index}: ${item.quantity} -> 1`);
                item.quantity = 1;
              }
            });
          }

          setCartItems(Array.isArray(items) ? items : []);
          return;
        } catch (retryError) {
          console.error('Retry also failed:', retryError);
        }
      }

      if (error.response?.status === 401) {
        Alert.alert('Error', 'Authentication failed. Please login again.');
        navigation.navigate('Login');
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        Alert.alert(
          'Network Error',
          errorMessage,
          [
            { text: 'OK' },
            {
              text: 'Diagnose',
              onPress: () => showNetworkDiagnostics()
            }
          ]
        );
      } else {
        Alert.alert('Error', errorMessage);
      }
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    console.log('🔧 updateQuantity called with:');
    console.log('   - productId:', productId);
    console.log('   - newQuantity:', newQuantity);
    console.log('   - newQuantity type:', typeof newQuantity);

    // Prevent rapid successive calls (debounce)
    const now = Date.now();
    if (now - lastUpdateTime < 500) { // 500ms debounce
      console.log('🔧 Debouncing rapid update call');
      return;
    }
    setLastUpdateTime(now);

    // Validate quantity - minimum 1, maximum 100
    if (newQuantity < 1) {
      console.log('🔧 Quantity < 1, removing from cart');
      removeFromCart(productId);
      return;
    }

    if (newQuantity > 100) {
      console.log('🔧 Quantity > 100, limiting to 100');
      newQuantity = 100;
    }

    // Prevent multiple simultaneous updates
    if (updatingQuantity) {
      console.log('🔧 Update already in progress, skipping');
      return;
    }

    try {
      setUpdatingQuantity(true);
      console.log('🔧 Updating quantity for productId:', productId, 'to:', newQuantity);

      // Ensure newQuantity is a valid number
      const quantityToSend = Math.max(1, Math.min(100, parseInt(newQuantity) || 1));

      console.log('🔧 Sending quantity to backend:', quantityToSend);

      // Try to use update endpoint first, fallback to add endpoint
      let response;
      try {
        response = await axios.put(API_URLS.UPDATE_CART_QUANTITY, {
          productId: productId,
          quantity: quantityToSend
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (updateError) {
        // If update endpoint doesn't exist, fallback to add endpoint
        console.log('Update endpoint not available, using add endpoint');
        response = await axios.post(API_URLS.ADD_TO_CART, {
          productId: productId,
          quantity: quantityToSend
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }

      console.log('✅ Update quantity response:', response.data);

      if (response.status === 200 || response.data.success) {
        // Update local state immediately for better UX
        setCartItems(prevItems =>
          prevItems.map(item => {
            const itemProductId = extractProductId(item);
            if (itemProductId === productId) {
              return { ...item, quantity: quantityToSend };
            }
            return item;
          })
        );

        // Add a small delay before refreshing to ensure backend has processed the update
        setTimeout(async () => {
          await fetchCartItems();
        }, 100);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to update quantity');
      }
    } catch (error) {
      console.error('❌ Error updating quantity:', error);
      const { errorMessage, shouldRetry } = handleNetworkError(error, 'Updating quantity');

      if (shouldRetry) {
        try {
          console.log('🔄 Retrying update quantity request...');
          const retryResponse = await retryRequest(async () => {
            try {
              return await axios.put(API_URLS.UPDATE_CART_QUANTITY, {
                productId: productId,
                quantity: quantityToSend
              }, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });
            } catch (updateError) {
              return await axios.post(API_URLS.ADD_TO_CART, {
                productId: productId,
                quantity: quantityToSend
              }, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });
            }
          });

          if (retryResponse.status === 200 || retryResponse.data.success) {
            // Update local state immediately for better UX
            setCartItems(prevItems =>
              prevItems.map(item => {
                const itemProductId = extractProductId(item);
                if (itemProductId === productId) {
                  return { ...item, quantity: quantityToSend };
                }
                return item;
              })
            );

            setTimeout(async () => {
              await fetchCartItems();
            }, 100);
            return;
          }
        } catch (retryError) {
          console.error('❌ Retry also failed:', retryError);
        }
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setUpdatingQuantity(false);
    }
  };

  
  const removeFromCart = async (productId) => {
    try {
      console.log('Removing product from cart:', productId);
  
      // Backend expects productId in URL params, not in body
      const response = await axios.delete(`${API_URLS.REMOVE_FROM_CART}/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
  
      console.log('Remove from cart response:', response.data);
  
      if (response.data.message) {
        // Backend returns { message: 'Product removed from cart', cart }
        setTimeout(async () => {
          await fetchCartItems();
        }, 100);
        Alert.alert('Success', 'Item removed from cart');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing from cart:', error.response?.data || error.message);
      
      if (error.response?.status === 404) {
        Alert.alert('Error', 'Product not found in cart');
      } else {
        Alert.alert('Error', 'Failed to remove item from cart');
      }
    }
  };
  
  

  
  const calculateSubtotal = () => {
    console.log('🔍 Calculating subtotal for cart items:', cartItems);
    
    return cartItems.reduce((total, item) => {
      // Try multiple possible price locations in the item structure
      let price = 0;
      
      // Check different possible price locations
      if (item.product?.price) {
        price = item.product.price;
      } else if (item.productId?.price) {
        price = item.productId.price;
      } else if (item.price) {
        price = item.price;
      } else if (item.product) {
        // If product is the direct object
        price = item.product.price || 0;
      }
      
      // Ensure price is a number
      price = parseFloat(price) || 0;
      
      // Get quantity and ensure it's a number
      let quantity = item.quantity;
      if (typeof quantity === 'string') {
        quantity = parseInt(quantity, 10);
      }
      quantity = parseInt(quantity) || 1;
      
      const itemTotal = price * quantity;
      console.log(`🔍 Item calculation: price=${price}, quantity=${quantity}, itemTotal=${itemTotal}`);
      
      return total + itemTotal;
    }, 0);
  };

  const calculateDeliveryFee = () => {
    const subtotal = calculateSubtotal();
    return subtotal > 0 ? 60 : 0; // Free delivery for orders above certain amount
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateDeliveryFee();
  };

  const renderCartItem = (item, index) => {
    console.log(`🔍 Rendering cart item ${index}:`, item);
    console.log(`🔍 Item ${index} - Raw quantity field:`, item.quantity);
    console.log(`🔍 Item ${index} - Quantity type:`, typeof item.quantity);
    console.log(`🔍 Item ${index} - Full item structure:`, JSON.stringify(item, null, 2));

    const product = item.product || item.productId || item;
    const productId = extractProductId(item);

    console.log(`🔍 Item ${index} - Extracted productId:`, productId);

    const productName = product.productName || product.name || 'Product Name';
    const productImage = product.image || product.productImage;
    const price = product.price || 0;

    // Ensure quantity is a number and handle edge cases
    let quantity = item.quantity;

    // Convert to number if it's a string
    if (typeof quantity === 'string') {
      quantity = parseInt(quantity, 10);
    }

    // Ensure it's a number
    if (typeof quantity !== 'number' || isNaN(quantity)) {
      quantity = 1;
    }

    // Ensure quantity is within reasonable bounds (minimum 1, maximum 100)
    if (quantity < 1) {
      quantity = 1;
    } else if (quantity > 100) {
      quantity = 100;
    }

    console.log(`🔍 Item ${index} - Processed quantity:`, quantity);
    const totalPrice = price * quantity;

    return (
      <View key={index} style={styles.cartItem}>
        {/* Product Image */}
        <View style={styles.productImageContainer}>
          {productImage ? (
            <Image
              source={{ uri: productImage }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image" size={30} color="#ccc" />
            </View>
          )}
        </View>

        {/* Product Details */}
        <View style={styles.productDetails}>
          <Text style={styles.productName} numberOfLines={2}>
            {productName}
          </Text>
          <Text style={styles.productPrice}>৳{price}</Text>

          {/* Quantity Controls */}
          <View style={styles.quantityContainer}>

            <TouchableOpacity
              style={[
                styles.quantityButton,
                quantity <= 1 && styles.quantityButtonDisabled
              ]}
              onPress={() => {
                if (updatingQuantity || quantity <= 1) return;
                const newQuantity = quantity - 1;
                updateQuantity(productId, newQuantity);
              }}
              disabled={updatingQuantity || quantity <= 1}
            >
              <Ionicons
                name="remove"
                size={16}
                color={updatingQuantity || quantity <= 1 ? "#ccc" : "#4CAF50"}
              />
            </TouchableOpacity>


            <View style={styles.quantityTextContainer}>
              <Text style={styles.quantityText}>
                {updatingQuantity ? '...' : quantity}
              </Text>
              {quantity >= 100 && (
                <Text style={styles.quantityLimitText}>Max</Text>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.quantityButton,
                quantity >= 100 && styles.quantityButtonDisabled
              ]}
              onPress={() => {
                if (updatingQuantity || quantity >= 100) {
                  console.log('🔧 Update in progress or quantity at maximum, ignoring button press');
                  return;
                }
                const newQuantity = quantity + 1;
                console.log(`➕ Increasing quantity for item ${index}`);
                console.log(`   - productId: ${productId}`);
                console.log(`   - current quantity: ${quantity}`);
                console.log(`   - new quantity: ${newQuantity}`);
                updateQuantity(productId, newQuantity);
              }}
              disabled={updatingQuantity || quantity >= 100}
            >
              <Ionicons
                name="add"
                size={16}
                color={updatingQuantity || quantity >= 100 ? "#ccc" : "#4CAF50"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Total Price and Remove Button */}
        <View style={styles.itemActions}>
          <Text style={styles.itemTotalPrice}>৳{totalPrice}</Text>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeFromCart(productId)}
          >
            <Ionicons name="trash-outline" size={20} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderBottomTab = (tabName, icon, label) => (
    <TouchableOpacity
      key={tabName}
      style={styles.tabItem}
      onPress={() => {
        if (tabName === 'home') {
          navigation.navigate('Dashboard', {
            userId,
            phoneNumber,
            userData,
            token
          });
        } else if (tabName === 'cart') {
          // Already on cart screen
          console.log('Already on cart screen');
        } else if (tabName === 'wishlist') {
          navigation.navigate('Wishlist', {
            userId,
            phoneNumber,
            userData,
            token
          });
        } else if (tabName === 'profile') {
          navigation.navigate('Profile', {
            userId,
            phoneNumber,
            userData,
            token
          });
        }
        setActiveBottomTab(tabName);
      }}
    >
      <Ionicons
        name={icon}
        size={24}
        color={activeBottomTab === tabName ? '#4CAF50' : '#666'}
      />
      <Text
        style={[
          styles.tabLabel,
          activeBottomTab === tabName && styles.activeTabLabel,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading cart...</Text>
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
        <Text style={styles.headerTitle}>Cart</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={fetchCartItems}
        >
          <Ionicons name="refresh" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={testAPI}
        >
          <Ionicons name="bug" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={showNetworkDiagnostics}
        >
          <Ionicons name="wifi" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={resetAllQuantities}
        >
          <Ionicons name="refresh-circle" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={debugPriceCalculation}
        >
          <Ionicons name="calculator" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {(() => {
          console.log('Rendering cart screen with items:', cartItems);
          console.log('Cart items length:', cartItems.length);
          return cartItems.length === 0 ? (
            <View style={styles.emptyCartContainer}>
              <Ionicons name="cart-outline" size={80} color="#ccc" />
              <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
              <Text style={styles.emptyCartSubtitle}>
                Add some products to your cart to get started
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
                <Text style={styles.browseButtonText}>Browse Products</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.cartContent}>
              {/* Cart Items */}
              <View style={styles.cartItemsContainer}>
                {cartItems.map(renderCartItem)}
              </View>

              {/* Price Summary */}
              <View style={styles.priceSummary}>
                <Text style={styles.summaryTitle}>Price Summary</Text>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>৳{calculateSubtotal()}</Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Delivery Fee</Text>
                  <Text style={styles.summaryValue}>৳{calculateDeliveryFee()}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.summaryRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>৳{calculateTotal()}</Text>
                </View>
              </View>

              {/* Checkout Button */}
              <TouchableOpacity 
                style={styles.checkoutButton}
                onPress={() => navigation.navigate('Checkout', {
                  userId,
                  phoneNumber,
                  userData,
                  token
                })}
              >
                <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
              </TouchableOpacity>
            </View>
          );
        })()}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        {renderBottomTab('home', 'home', 'Home')}
        {renderBottomTab('cart', 'cart', 'Cart')}
        {renderBottomTab('wishlist', 'heart', 'Wishlist')}
        {renderBottomTab('profile', 'person', 'Profile')}
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
  refreshButton: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
    paddingBottom: 80, // Add space for bottom navigation
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
  emptyCartContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyCartTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyCartSubtitle: {
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
  cartContent: {
    padding: 20,
  },
  cartItemsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cartItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productImageContainer: {
    width: 80,
    height: 80,
    marginRight: 15,
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  quantityButtonDisabled: {
    backgroundColor: '#f0f0f0',
    opacity: 0.6,
  },
  quantityTextContainer: {
    alignItems: 'center',
    marginHorizontal: 15,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  quantityLimitText: {
    fontSize: 10,
    color: '#ff6b6b',
    fontWeight: 'bold',
    marginTop: 2,
  },
  itemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginLeft: 10,
  },
  itemTotalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  removeButton: {
    padding: 5,
  },
  priceSummary: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  checkoutButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  activeTabLabel: {
    color: '#4CAF50',
    fontWeight: '600',
  },
});

export default CartScreen;
