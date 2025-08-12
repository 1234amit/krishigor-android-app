import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URLS } from '../config/api';

const WishlistScreen = ({ navigation, route }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [activeBottomTab, setActiveBottomTab] = useState('wishlist');
  const { userId, phoneNumber, userData, token } = route.params || {};

  useEffect(() => {
    // Check if we have valid authentication data
    if (!token) {
      console.warn('No authentication token found - showing empty wishlist');
      setWishlistItems([]);
      setCategories([]);
      setLoading(false);
    } else {
      fetchWishlist();
    }
  }, [token]);

  // Monitor wishlistItems state changes
  useEffect(() => {
    console.log('🔄 wishlistItems state changed:', {
      length: wishlistItems.length,
      items: wishlistItems
    });
  }, [wishlistItems]);

  // Monitor component re-renders
  useEffect(() => {
    console.log('🔄 Component re-rendered, current state:', {
      wishlistItemsLength: wishlistItems.length,
      activeCategory: activeCategory
    });
  });

  // Add pull-to-refresh functionality
  const onRefresh = () => {
    fetchWishlist();
  };

  // Debug function to test API directly
  const debugWishlistAPI = async () => {
    try {
      console.log('=== DEBUGGING WISHLIST API ===');
      const response = await axios.get(API_URLS.GET_WISHLIST, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Full API Response:', JSON.stringify(response.data, null, 2));
      console.log('Response success:', response.data.success);
      console.log('Response data type:', typeof response.data.data);
      console.log('Response data is array:', Array.isArray(response.data.data));
      
      if (Array.isArray(response.data.data)) {
        console.log('Number of items:', response.data.data.length);
        response.data.data.forEach((item, index) => {
          console.log(`Item ${index}:`, JSON.stringify(item, null, 2));
          
          // Check for tomato specifically
          const productName = item.product?.productName || item.product?.name || item.productName || item.name;
          if (productName && productName.toLowerCase().includes('tomato')) {
            console.log('🎯 FOUND TOMATO:', item);
          }
        });
        
        // Check current state
        console.log('Current wishlistItems state:', wishlistItems);
      }
      console.log('=== END DEBUG ===');
    } catch (error) {
      console.error('Debug API Error:', error);
    }
  };

  // Test function to manually set state
  const testSetState = () => {
    console.log('🧪 TEST: Manually setting state with tomato');
    const testItem = {
      _id: '688107a8521807cd41181271',
      product: {
        _id: '687e81c38d81ee0424e95d9e',
        productName: 'Tomato',
        price: '90000',
        image: 'https://media.istockphoto.com/id/847335116/photo/tomatoes-on-the-vine.jpg?s=612x612&w=0&k=20&c=XspM2ySvUfqjnt7HL5qKyn0tyRb5qLsf1GAP6-3xQsw=',
        category: '687e813a8d81ee0424e95d98',
        rating: '4.5',
        description: 'potatocreackers -lin'
      }
    };
    setWishlistItems([testItem]);
    console.log('🧪 TEST: State set with test item');
  };

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      console.log('Fetching wishlist...');
      
      // Check if token exists
      if (!token) {
        console.warn('No token available for wishlist API call');
        setWishlistItems([]);
        setCategories([]);
        return;
      }
      
      const response = await axios.get(API_URLS.GET_WISHLIST, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Wishlist API response:', {
        success: response.data.success,
        data: response.data.data,
        dataType: typeof response.data.data,
        isArray: Array.isArray(response.data.data),
        fullResponse: response.data
      });

      if (response.data.success) {
        console.log('✅ API call successful, processing data...');
        
        // Extract items from API response with fallback
        const rawItems = response.data.data?.items || response.data.data || [];
        console.log('📦 Raw items extracted:', rawItems.length, 'items');
        
        // Process items with robust error handling
        const processedItems = rawItems.map((item, index) => {
          try {
            console.log(`🔄 Processing item ${index}:`, item);
            
            const processedItem = {
              _id: item.id || item._id || `item-${index}`,
              product: {
                _id: item.productId || item.product?._id || `product-${index}`,
                productName: item.productName || item.product?.productName || 'Unknown Product',
                price: item.price || item.product?.price || '0',
                image: item.image || item.product?.image || 'https://via.placeholder.com/150',
                category: item.category || item.product?.category || 'Other',
                rating: '4.5',
                description: item.description || item.product?.description || 'No description available'
              }
            };
            
            console.log(`✅ Item ${index} processed:`, processedItem);
            return processedItem;
          } catch (error) {
            console.error(`❌ Error processing item ${index}:`, error);
            return null;
          }
        }).filter(item => item !== null); // Remove any failed items
          
        console.log('Processed wishlist items:', processedItems);
        console.log('Setting wishlistItems state with:', processedItems.length, 'items');
        
        // Test if we have valid items
        if (processedItems.length > 0) {
          console.log('✅ SUCCESS: Found', processedItems.length, 'items to display');
          console.log('First processed item:', processedItems[0]);
        } else {
          console.log('❌ ERROR: No items processed successfully');
        }
        
        console.log('About to set wishlistItems state with:', processedItems);
        
        setWishlistItems(processedItems);
        console.log('✅ State update completed');
        
        // Verify state was set
        setTimeout(() => {
          console.log('🔄 State verification - wishlistItems should now have', processedItems.length, 'items');
          console.log('🔄 Current wishlistItems state:', wishlistItems);
        }, 100);
        
        console.log('State set - wishlistItems should now have', processedItems.length, 'items');
        
        // Extract categories from processed items or use categoryCounts from API
        let categoryList = [];
        
        if (response.data.data.categoryCounts && Array.isArray(response.data.data.categoryCounts)) {
          // Use categoryCounts from API response
          categoryList = response.data.data.categoryCounts.map(cat => ({
            category: cat.category,
            count: cat.count
          }));
          console.log('Using categoryCounts from API:', categoryList);
        } else {
          // Extract categories from processed items
          const categoryMap = {};
          processedItems.forEach(item => {
            const category = item.product?.category || 'Other';
            categoryMap[category] = (categoryMap[category] || 0) + 1;
          });
          
          categoryList = Object.entries(categoryMap).map(([category, count]) => ({
            category,
            count
          }));
          console.log('Categories extracted from items:', categoryList);
        }
        
        // Don't set any categories - only show "All" tab
        setCategories([]);
      } else {
        console.error('Failed to fetch wishlist:', response.data.message);
        // No fallback - show empty state
        setWishlistItems([]);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Handle authentication errors specifically
      if (error.response?.status === 401) {
        console.warn('Authentication failed - token may be expired');
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please log in again.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      }
      
      // No fallback - show empty state
      setWishlistItems([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (wishlistId) => {
    try {
      console.log('Removing wishlist item with ID:', wishlistId);
      
      const response = await axios.delete(`${API_URLS.REMOVE_FROM_WISHLIST}/${wishlistId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Remove from wishlist response:', response.data);

      if (response.data.success) {
        setWishlistItems(prev => prev.filter(item => item._id !== wishlistId));
        Alert.alert('Success', 'Product removed from wishlist');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to remove from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      Alert.alert('Error', 'Failed to remove from wishlist');
    }
  };

  const handleRemoveItem = (item) => {
    Alert.alert(
      'Remove from Wishlist',
      `Remove "${item.product?.productName || 'Product'}" from wishlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeFromWishlist(item._id) }
      ]
    );
  };

  const getFilteredItems = () => {
    console.log('getFilteredItems called with:', { activeCategory, wishlistItemsLength: wishlistItems.length });
    if (activeCategory === 'all') {
      console.log('Returning all items:', wishlistItems);
      return wishlistItems;
    }
    const filtered = wishlistItems.filter(item => 
      item.product?.category === activeCategory
    );
    console.log('Filtered items for category', activeCategory, ':', filtered);
    return filtered;
  };

  const renderWishlistItem = ({ item }) => {
    console.log('Rendering wishlist item:', item);
    
    // Ensure we have the correct data structure
    const product = item.product || item;
    console.log('Product data:', product);
    
    // Handle missing or invalid data gracefully
    const productName = product?.productName || product?.name || 'Unknown Product';
    const price = product?.price || '0';
    const image = product?.image || null;
    let category = product?.category || 'Other';
    const rating = product?.rating || '4.5';
    
    // Clean up category name
    // if (category === '687e813a8d81ee0424e95d98') {
    //   category = 'Agriculture';
    // } else if (category === '687e813a8d81ee0424e95d99') {
    //   category = 'Fruits';
    // } else if (category === '687e813a8d81ee0424e95d9a') {
    //   category = 'Grains';
    // } else if (category === '687e813a8d81ee0424e95d9b') {
    //   category = 'Dairy';
    // } else if (category.length > 20) {
    //   category = 'Agriculture';
    // }
    
    console.log('Extracted product data:', { productName, price, image, category, rating });
    
    return (
      <TouchableOpacity 
        style={styles.wishlistItem}
        onPress={() => {
          console.log('Navigating to product details for:', productName);
          navigation.navigate('ProductDetails', {
            productId: product._id || product.id,
            userId,
            phoneNumber,
            userData,
            token
          });
        }}
        activeOpacity={0.7}
      >
        <Image 
          source={{ uri: image }} 
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryText}>
                {category}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.wishlistIcon}
              onPress={(e) => {
                e.stopPropagation(); // Prevent navigation when clicking heart icon
                handleRemoveItem(item);
              }}
            >
              <Ionicons name="heart" size={20} color="#4CAF50" />
            </TouchableOpacity>
          </View>
          <Text style={styles.productName} numberOfLines={2}>
            {productName}
          </Text>
          <Text style={styles.productPrice}>
            Price: ৳{price}/kg
          </Text>
          <View style={styles.reviewsContainer}>
            <Text style={styles.reviewsText}>
              Reviews: ⭐ {rating}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
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
          // Navigate to cart screen (to be implemented)
          console.log('Cart pressed');
        } else if (tabName === 'wishlist') {
          // Already on wishlist screen
          setActiveBottomTab(tabName);
        } else if (tabName === 'profile') {
          navigation.navigate('Profile', {
            userId,
            phoneNumber,
            userData,
            token
          });
        } else if (tabName === 'more') {
          // Show logout modal or more options
          console.log('More pressed');
        } else {
          setActiveBottomTab(tabName);
        }
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

  const filteredItems = useMemo(() => {
    console.log('🔁 useMemo getFilteredItems:', {
      activeCategory,
      wishlistItemsLength: wishlistItems.length,
    });
  
    if (activeCategory === 'all') {
      return wishlistItems;
    }
  
    return wishlistItems.filter(
      (item) => item.product?.category === activeCategory
    );
  }, [wishlistItems, activeCategory]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading wishlist...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Wishlist</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Ionicons name="refresh" size={20} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.debugButton} onPress={debugWishlistAPI}>
            <Ionicons name="search" size={20} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.testButton} onPress={testSetState}>
            <Ionicons name="play" size={20} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryTabs}
      >
        <TouchableOpacity
          style={[
            styles.categoryTab,
            activeCategory === 'all' && styles.activeCategoryTab
          ]}
          onPress={() => setActiveCategory('all')}
        >
          <Text style={[
            styles.categoryTabText,
            activeCategory === 'all' && styles.activeCategoryTabText
          ]}>
            All ({wishlistItems.length})
          </Text>
        </TouchableOpacity>
        
        {categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.categoryTab,
              activeCategory === category.category && styles.activeCategoryTab
            ]}
            onPress={() => setActiveCategory(category.category)}
          >
            <Text style={[
              styles.categoryTabText,
              activeCategory === category.category && styles.activeCategoryTabText
            ]}>
              {category.category} ({category.count})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Wishlist Items */}
      {filteredItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
          <Text style={styles.emptySubtitle}>
            Start adding products to your wishlist to see them here
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('Dashboard')}
          >
            <Text style={styles.browseButtonText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        console.log('🎯 About to render FlatList with', filteredItems.length, 'items:', filteredItems),
        <FlatList
          key={`wishlist-${activeCategory}`}
          data={filteredItems}
          renderItem={renderWishlistItem}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.wishlistList}
          refreshing={loading}
          onRefresh={onRefresh}
        />
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        {renderBottomTab('home', 'home', 'Home')}
        {renderBottomTab('cart', 'cart', 'Carts')}
        {renderBottomTab('wishlist', 'heart', 'Wishlist')}
        {renderBottomTab('profile', 'person', 'Profile')}
        {renderBottomTab('more', 'ellipsis-horizontal', 'More')}
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
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  headerSpacer: {
    width: 40,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  debugButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  testButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTabs: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginTop: 5,
  },
  categoryTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 10,
    borderRadius: 16,
    backgroundColor: '#f8f8f8',
    minWidth: 75,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeCategoryTab: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryTabText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  activeCategoryTabText: {
    color: 'white',
    fontWeight: '600',
  },
  wishlistList: {
    paddingTop: 10,
    paddingBottom: 100,
  },
  wishlistItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f8f8f8',
  },
  productImage: {
    width: 85,
    height: 85,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: '#f8f8f8',
  },
  productInfo: {
    flex: 1,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  categoryTag: {
    backgroundColor: '#f0f8f0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e8f5e8',
  },
  categoryText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  wishlistIcon: {
    padding: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 4,
  },
  reviewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewsText: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  browseButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  browseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 35 : 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 4,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

export default WishlistScreen; 