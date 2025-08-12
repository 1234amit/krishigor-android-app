import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  ScrollView,
  TextInput,
  Image,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URLS } from '../config/api';
import { handleNetworkError, retryRequest, showNetworkDiagnostics } from '../utils/networkUtils';
import defaultCategoryImage from '../assets/20945573.jpg';
import bannerImage from '../assets/Frame-1.png';

const DashboardScreen = ({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [productsForYouPage, setProductsForYouPage] = useState(0);
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // Store all products
  const [productsLoading, setProductsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const productsScrollViewRef = useRef(null);
  const { userId, phoneNumber, userData, token } = route.params || {};

  // Fetch categories and products from API
  useEffect(() => {
    // Check if we have valid authentication data
    if (!token) {
      console.warn('No authentication token found - using fallback data');
      setCategories(getDefaultCategories());
      const sampleProducts = getSampleProducts();
      setAllProducts(sampleProducts);
      setProducts(sampleProducts);
      setCategoriesLoading(false);
      setProductsLoading(false);
    } else {
      fetchCategories();
      fetchProducts();
    }
  }, [token]);

  // Filter products when search query changes
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      performSearch(searchQuery);
    }, 300); // 300ms delay

    setSearchTimeout(timeout);

    // Cleanup timeout on unmount
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [searchQuery, allProducts]);

  const performSearch = (query) => {
    if (!query.trim()) {
      setFilteredProducts(allProducts);
      setProducts(allProducts);
      return;
    }

    const searchTerm = query.toLowerCase().trim();
    const filtered = allProducts.filter(product => {
      const productName = product.productName?.toLowerCase() || '';
      const description = product.description?.toLowerCase() || '';
      const category = product.category?.toLowerCase() || '';
      
      return productName.includes(searchTerm) || 
             description.includes(searchTerm) || 
             category.includes(searchTerm);
    });

    console.log('Search results:', {
      query: searchTerm,
      totalProducts: allProducts.length,
      filteredCount: filtered.length,
      results: filtered.map(p => p.productName)
    });

    setFilteredProducts(filtered);
    setProducts(filtered);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredProducts(allProducts);
    setProducts(allProducts);
  };

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      
      // Check if token exists
      if (!token) {
        console.warn('No token available for categories API call');
        setCategories(getDefaultCategories());
        return;
      }
      
      const response = await retryRequest(async () => {
        return axios.get(API_URLS.CATEGORIES, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      });
      
      if (response.data.message === 'Categories fetched successfully') {
        setCategories(response.data.categories || []);
      } else {
        console.error('Failed to fetch categories:', response.data.message);
        // Fallback to default categories if API fails
        setCategories(getDefaultCategories());
      }
    } catch (error) {
      const { message } = handleNetworkError(error);
      console.error('Error fetching categories:', message);
      
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
      
      // Fallback to default categories if API fails
      setCategories(getDefaultCategories());
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      
      // Check if token exists
      if (!token) {
        console.warn('No token available for products API call');
        const sampleProducts = getSampleProducts();
        setAllProducts(sampleProducts);
        setProducts(sampleProducts);
        return;
      }
      
      const response = await retryRequest(async () => {
        return axios.get(API_URLS.PRODUCTS, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      });
      
      if (response.data.products && Array.isArray(response.data.products)) {
        // Sort products by creation date (newest first)
        const sortedProducts = (response.data.products || []).sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA; // Newest first
        });
        setAllProducts(sortedProducts);
        setProducts(sortedProducts);
      } else {
        console.error('Failed to fetch products:', response.data.message || 'Invalid response format');
        // Fallback to sample products if API fails
        const sampleProducts = getSampleProducts();
        setAllProducts(sampleProducts);
        setProducts(sampleProducts);
      }
    } catch (error) {
      const { message } = handleNetworkError(error);
      console.error('Error fetching products:', message);
      
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
      
      // Fallback to sample products if API fails
      const sampleProducts = getSampleProducts();
      setAllProducts(sampleProducts);
      setProducts(sampleProducts);
    } finally {
      setProductsLoading(false);
    }
  };

  // Fallback sample products if API fails
  const getSampleProducts = () => [
    {
      _id: '1',
      productName: 'Fresh Rice',
      description: 'Premium quality rice from local farms',
      price: '৳45',
      rating: '4.5',
      discount: '20% Off',
      image: null,
      category: 'Rice',
      categoryId: 'rice',
    },
    {
      _id: '2',
      productName: 'Organic Corn',
      description: 'Sweet organic corn kernels',
      price: '৳25',
      rating: '4.8',
      discount: '15% Off',
      image: null,
      category: 'Corn',
      categoryId: 'corn',
    },
    {
      _id: '3',
      productName: 'Fresh Tomatoes',
      description: 'Red ripe tomatoes from garden',
      price: '৳30',
      rating: '4.6',
      discount: '10% Off',
      image: null,
      category: 'Vegetable',
      categoryId: 'vegetable',
    },
    {
      _id: '4',
      productName: 'Fresh Garlic',
      description: 'Organic garlic bulbs',
      price: '৳35',
      rating: '4.7',
      discount: '12% Off',
      image: null,
      category: 'Gar',
      categoryId: 'gar',
    },
    {
      _id: '5',
      productName: 'Poultry Egg',
      description: 'Fresh farm eggs',
      price: '৳10',
      rating: '4.9',
      discount: '8% Off',
      image: null,
      category: 'Agriculture',
      categoryId: 'agriculture',
    },
    {
      _id: '6',
      productName: 'Fresh Milk',
      description: 'Pure cow milk',
      price: '৳60',
      rating: '4.4',
      discount: '18% Off',
      image: null,
      category: 'Farm',
      categoryId: 'farm',
    },
    {
      _id: '7',
      productName: 'Organic Honey',
      description: 'Natural sweet honey',
      price: '৳80',
      rating: '4.3',
      discount: '5% Off',
      image: null,
      category: 'Agriculture',
      categoryId: 'agriculture',
    },
    {
      _id: '8',
      productName: 'Fresh Carrots',
      description: 'Orange fresh carrots',
      price: '৳20',
      rating: '4.2',
      discount: '25% Off',
      image: null,
      category: 'Vegetable',
      categoryId: 'vegetable',
    },
  ];

  // Fallback default categories if API fails
  const getDefaultCategories = () => [
    { _id: 'rice', name: 'Rice', icon: 'leaf' },
    { _id: 'corn', name: 'Corn', icon: 'nutrition' },
    { _id: 'vegetable', name: 'Vegetable', icon: 'restaurant' },
    { _id: 'gar', name: 'Gar', icon: 'flower' },
    { _id: 'agriculture', name: 'Agriculture', icon: 'business' },
    { _id: 'farm', name: 'Farm', icon: 'home' },
  ];

  // Handle category selection
  const handleCategoryPress = (category) => {
    console.log('Category pressed:', {
      categoryName: category.name,
      categoryId: category._id,
    });

    // Navigate to category products screen
    navigation.navigate('CategoryProducts', {
      category,
      userId,
      phoneNumber,
      userData,
      token
    });
  };

  const renderProductCard = (product) => (
    <TouchableOpacity 
      key={product._id} 
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetails', {
        productId: product._id,
        userId,
        phoneNumber,
        userData,
        token
      })}
    >
      <View style={styles.productImageContainer}>
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>
            {product.discount || 'New'}
          </Text>
        </View>
        {product.image ? (
          <Image 
            source={{ uri: product.image }} 
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.productImagePlaceholder}>
            <Ionicons name="image" size={40} color="#ccc" />
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.productName}</Text>
        <Text style={styles.productDescription}>
          {product.description?.length > 50 
            ? `${product.description.substring(0, 50)}...` 
            : product.description}
        </Text>
        <View style={styles.productBottom}>
          <Text style={styles.productPrice}>৳{product.price}</Text>
          <View style={styles.productRating}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>
              {product.rating || '4.5'}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.addToCartButton}>
          <Ionicons name="add" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Pagination functions for Products for You
  const productsPerPage = 4;
  const totalPages = Math.ceil(products.length / productsPerPage);

  const handlePreviousPage = () => {
    console.log('Previous button clicked. Current page:', productsForYouPage, 'Total pages:', totalPages, 'Products length:', products.length);
    if (productsForYouPage > 0) {
      const newPage = productsForYouPage - 1;
      setProductsForYouPage(newPage);
      // Scroll to the new page
      if (productsScrollViewRef.current) {
        const cardWidth = 160 + 18; // card width + margin
        const scrollX = newPage * cardWidth * 4; // 4 cards per page
        console.log('Scrolling to:', scrollX, 'for page:', newPage, 'Card width:', cardWidth);
        productsScrollViewRef.current.scrollTo({
          x: scrollX,
          animated: true
        });
      } else {
        console.log('ScrollView ref is null!');
      }
    } else {
      console.log('Cannot go to previous page - already at first page');
    }
  };

  const handleNextPage = () => {
    console.log('Next button clicked. Current page:', productsForYouPage, 'Total pages:', totalPages, 'Products length:', products.length);
    if (productsForYouPage < totalPages - 1) {
      const newPage = productsForYouPage + 1;
      setProductsForYouPage(newPage);
      // Scroll to the new page
      if (productsScrollViewRef.current) {
        const cardWidth = 160 + 18; // card width + margin
        const scrollX = newPage * cardWidth * 4; // 4 cards per page
        console.log('Scrolling to:', scrollX, 'for page:', newPage, 'Card width:', cardWidth);
        productsScrollViewRef.current.scrollTo({
          x: scrollX,
          animated: true
        });
      } else {
        console.log('ScrollView ref is null!');
      }
    } else {
      console.log('Cannot go to next page - already at last page');
    }
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      const response = await retryRequest(async () => {
        return axios.post(API_URLS.LOGOUT, {
          userId: userId
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      });
      
      console.log('Logout response:', response.data);
      
      if (response.data.message === 'Logout successful') {
        Alert.alert(
          'Logout Successful',
          'You have been logged out successfully.',
          [
            {
              text: 'OK',
              onPress: () => {
                setShowLogoutModal(false);
                // Navigate back to login screen
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              }
            }
          ]
        );
      } else {
        Alert.alert('Logout Error', response.data.message || 'Logout failed');
      }
    } catch (error) {
      const { message, shouldRetry } = handleNetworkError(error);
      console.error('Logout error:', message);
      
      if (shouldRetry) {
        Alert.alert(
          'Network Error', 
          'Unable to logout. Please check your connection and try again.',
          [
            { text: 'OK' },
            { text: 'Diagnose Network', onPress: showNetworkDiagnostics }
          ]
        );
      } else {
        Alert.alert('Logout Error', 'Logout failed. Please try again.');
      }
    } finally {
      setLogoutLoading(false);
    }
  };

  const renderBottomTab = (tabName, icon, label) => (
    <TouchableOpacity
      key={tabName}
      style={styles.tabItem}
      onPress={() => {
        if (tabName === 'more') {
          setShowLogoutModal(true);
        } else if (tabName === 'profile') {
          navigation.navigate('Profile', {
            userId,
            phoneNumber,
            userData,
            token
          });
        } else if (tabName === 'wishlist') {
          navigation.navigate('Wishlist', {
            userId,
            phoneNumber,
            userData,
            token
          });
        } else if (tabName === 'cart') {
          navigation.navigate('Cart', {
            userId,
            phoneNumber,
            userData,
            token
          });
        } else {
          setActiveTab(tabName);
        }
      }}
    >
      <Ionicons
        name={icon}
        size={24}
        color={activeTab === tabName ? '#4CAF50' : '#666'}
      />
      <Text
        style={[
          styles.tabLabel,
          activeTab === tabName && styles.activeTabLabel,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Text style={styles.timeText}>09:25 PM</Text>
        </View>
        <View style={styles.statusBar}>
          <Ionicons name="wifi" size={16} color="#333" />
          <Ionicons name="cellular" size={16} color="#333" />
          <Ionicons name="battery-full" size={16} color="#333" />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileInfo}>
            <View style={styles.profileImage}>
              <Ionicons name="person" size={30} color="#4CAF50" />
            </View>
            <View style={styles.profileText}>
              <Text style={styles.greeting}>
                Hi! {userData?.name || userData?.fullName || 'User'} 👋
              </Text>
              <Text style={styles.location}>
                {userData?.address || userData?.location || userData?.division || 'Location not set'}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications" size={24} color="#333" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>5</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <TouchableOpacity style={styles.scanButton}>
              <Ionicons name="scan" size={20} color="#666" />
            </TouchableOpacity>
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={text => {
                setSearchQuery(text);
                if (text.trim().length > 0) {
                  navigation.navigate('SearchResults', {
                    searchQuery: text,
                    allProducts,
                    userId,
                    phoneNumber,
                    userData,
                    token
                  });
                }
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={clearSearch}
              >
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="options" size={20} color="white" />
            </TouchableOpacity>
          </View>
          {searchQuery.length > 0 && (
            <View style={styles.searchResultsInfo}>
              <Text style={styles.searchResultsText}>
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found for "{searchQuery}"
              </Text>
            </View>
          )}
        </View>

        {/* Banner/Carousel */}
        <View style={styles.bannerSection}>
          <View style={styles.bannerImage}>
            <Image 
              source={bannerImage}
              style={styles.bannerImageStyle}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
          </View>
          
          {categoriesLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#4CAF50" />
              <Text style={styles.loadingText}>Loading categories...</Text>
            </View>
          ) : categories.length > 0 ? (
            <View style={styles.categoriesGrid}>
              {categories.map((category) => (
                <TouchableOpacity 
                  key={category._id} 
                  style={styles.categoryItem}
                  onPress={() => handleCategoryPress(category)}
                >
                  <View style={styles.categoryIcon}>
                    {category.image ? (
                      <Image
                        source={{ uri: category.image }}
                        style={{ width: 40, height: 40, borderRadius: 20 }}
                        resizeMode="cover"
                      />
                    ) : (
                      <Image
                        source={defaultCategoryImage}
                        style={{ width: 40, height: 40, borderRadius: 20 }}
                        resizeMode="cover"
                      />
                    )}
                  </View>
                  <Text style={styles.categoryName}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.noCategoriesContainer}>
              <Ionicons name="alert-circle-outline" size={24} color="#ccc" />
              <Text style={styles.noCategoriesText}>No categories available</Text>
            </View>
          )}
          
          <View style={styles.adBanner}>
            <Text style={styles.adText}>Special Offers</Text>
          </View>
        </View>

        {/* Products for You */}
        <View style={styles.productsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {searchQuery.length > 0 ? `Search Results for "${searchQuery}"` : 'Products for You'}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('AllProducts', {
                userId,
                phoneNumber,
                userData,
                token
              })}
            >
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          
          {productsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>Loading products...</Text>
            </View>
          ) : products.length > 0 ? (
            <>
              <View style={styles.productsContainer}>
                {/* Left Arrow */}
                <TouchableOpacity 
                  style={[
                    styles.navigationArrow, 
                    styles.leftArrow,
                    productsForYouPage === 0 && styles.disabledArrow,
                    { backgroundColor: productsForYouPage === 0 ? '#f5f5f5' : '#ffffff' }
                  ]}
                  onPress={handlePreviousPage}
                  disabled={productsForYouPage === 0}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name="chevron-back" 
                    size={18} 
                    color={productsForYouPage === 0 ? '#ccc' : '#4CAF50'} 
                  />
                </TouchableOpacity>

                {/* Products ScrollView */}
                <ScrollView 
                  ref={productsScrollViewRef}
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.productsScrollView}
                  onScroll={(event) => {
                    const offsetX = event.nativeEvent.contentOffset.x;
                    const cardWidth = 160 + 18; // card width + margin
                    const cardsPerPage = 4;
                    const pageWidth = cardWidth * cardsPerPage;
                    const currentPage = Math.round(offsetX / pageWidth);
                    console.log('Scroll offset:', offsetX, 'Current page:', currentPage, 'Page width:', pageWidth);
                    if (currentPage !== productsForYouPage && currentPage >= 0 && currentPage < totalPages) {
                      setProductsForYouPage(currentPage);
                    }
                  }}
                  scrollEventThrottle={16}
                  pagingEnabled={false}
                >
                  {products.map(renderProductCard)}
                </ScrollView>

                {/* Right Arrow */}
                <TouchableOpacity 
                  style={[
                    styles.navigationArrow, 
                    styles.rightArrow,
                    productsForYouPage === totalPages - 1 && styles.disabledArrow,
                    { backgroundColor: productsForYouPage === totalPages - 1 ? '#f5f5f5' : '#ffffff' }
                  ]}
                  onPress={handleNextPage}
                  disabled={productsForYouPage === totalPages - 1}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name="chevron-forward" 
                    size={18} 
                    color={productsForYouPage === totalPages - 1 ? '#ccc' : '#4CAF50'} 
                  />
                </TouchableOpacity>
              </View>
              
              {/* Page Indicators */}
              {totalPages > 1 && (
                <View style={styles.pageIndicators}>
                  {Array.from({ length: totalPages }, (_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.pageIndicator,
                        index === productsForYouPage && styles.activePageIndicator
                      ]}
                    />
                  ))}
                </View>
              )}
            </>
          ) : (
            <View style={styles.noProductsContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#ccc" />
              <Text style={styles.noProductsText}>
                {searchQuery.length > 0 
                  ? `No products found for "${searchQuery}"` 
                  : 'No products available'}
              </Text>
              {searchQuery.length > 0 && (
                <TouchableOpacity 
                  style={styles.clearSearchButton}
                  onPress={clearSearch}
                >
                  <Text style={styles.clearSearchText}>Clear Search</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Flash Sale */}
        <View style={styles.productsSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.flashSaleHeader}>
              <Text style={styles.sectionTitle}>Flash Sale ⚡</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          {productsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {products.slice(0, 6).map(renderProductCard)}
            </ScrollView>
          )}
        </View>

        {/* Ad Banner */}
        <View style={styles.adBanner}>
          <Text style={styles.adText}>Premium Products</Text>
        </View>

        {/* Top Selling Products */}
        <View style={styles.productsSectionLast}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Selling Products</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          {productsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {products.slice(0, 6).map(renderProductCard)}
            </ScrollView>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        {renderBottomTab('home', 'home', 'Home')}
        {renderBottomTab('cart', 'cart', 'Carts')}
        {renderBottomTab('wishlist', 'heart', 'Wishlist')}
        {renderBottomTab('profile', 'person', 'Profile')}
        {renderBottomTab('more', 'ellipsis-horizontal', 'More')}
      </View>

      {/* Logout Modal */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLogoutModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>More Options</Text>
              <TouchableOpacity
                onPress={() => setShowLogoutModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              disabled={logoutLoading}
            >
              {logoutLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="log-out-outline" size={20} color="white" />
                  <Text style={styles.logoutButtonText}>Logout</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 10,
  },
  timeText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scrollView: {
    flex: 1,
    paddingBottom: 80, // Add space for bottom navigation
    paddingTop: 10, // Add top padding for better spacing
  },
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15, // Reduced from 20 to 15
    marginBottom: 8, // Reduced from 10 to 8
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // Added to take available space
  },
  profileImage: {
    width: 45, // Reduced from 50 to 45
    height: 45, // Reduced from 50 to 45
    borderRadius: 22.5, // Adjusted for new size
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10, // Reduced from 12 to 10
  },
  profileText: {
    flex: 1,
    marginRight: 8, // Reduced from 10 to 8
  },
  greeting: {
    fontSize: 17, // Reduced from 18 to 17
    fontWeight: '600',
    color: '#333',
  },
  location: {
    fontSize: 13, // Reduced from 14 to 13
    color: '#666',
    marginTop: 1, // Reduced from 2 to 1
  },
  notificationButton: {
    position: 'relative',
    padding: 8, // Reduced padding
    minWidth: 35, // Reduced from 40 to 35
    alignItems: 'center',
    justifyContent: 'center',
    // marginRight: 100,
  },
  notificationBadge: {
    position: 'absolute',
    top: 2, // Reduced from 4 to 2 
    right: 2, // Reduced from 4 to 2
    backgroundColor: '#4CAF50',
    borderRadius: 8, // Reduced from 10 to 8
    width: 16, // Reduced from 18 to 16
    height: 16, // Reduced from 18 to 16
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5, // Reduced from 2 to 1.5
    borderColor: 'white',
  },
  notificationCount: {
    color: 'white',
    fontSize: 9, // Reduced from 10 to 9
    fontWeight: 'bold',
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 25, // Increased from 20 to 25
    marginTop: 15, // Increased from 10 to 15
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  scanButton: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filterButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButton: {
    marginRight: 10,
  },
  searchResultsInfo: {
    paddingHorizontal: 10,
    marginTop: 10,
    backgroundColor: '#e0f7fa',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  searchResultsText: {
    fontSize: 14,
    color: '#00796b',
    fontWeight: '500',
  },
  bannerSection: {
    paddingHorizontal: 20,
    marginBottom: 30, // Increased from 25 to 30
  },
  bannerImage: {
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bannerPlaceholder: {
    flex: 1,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
  },
  carouselDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
  },
  activeDot: {
    backgroundColor: '#4CAF50',
    width: 12,
  },
  categoriesSection: {
    paddingHorizontal: 20,
    marginBottom: 30, // Increased from 25 to 30
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 18, // Increased from 15 to 18
  },
  categoriesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25, // Increased from 20 to 25
  },
  categoryItem: {
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#f0f8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  selectedCategoryItem: {
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 10,
    padding: 5,
  },
  adBanner: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 25, // Increased from 20 to 25
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 25, // Increased from 20 to 25
    marginTop: 10, // Add top margin for better spacing
  },
  adText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  productsSection: {
    paddingHorizontal: 20,
    marginBottom: 30, // Increased from 25 to 30
  },
  productsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  productsScrollView: {
    flex: 1,
  },
  navigationArrow: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -15 }],
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  leftArrow: {
    left: 5,
  },
  rightArrow: {
    right: 5,
  },
  disabledArrow: {
    backgroundColor: '#f5f5f5',
  },
  pageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    gap: 8,
  },
  pageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
  },
  activePageIndicator: {
    backgroundColor: '#4CAF50',
    width: 12,
  },

  productsSectionLast:{
    paddingHorizontal: 20,
    marginBottom: 130, // Increased from 25 to 30

  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18, // Increased from 15 to 18
  },
  flashSaleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  productCard: {
    width: 160,
    backgroundColor: 'white',
    borderRadius: 12,
    marginRight: 18, // Increased from 15 to 18
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImageContainer: {
    position: 'relative',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 1,
  },
  discountText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  productImagePlaceholder: {
    height: 120,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  productInfo: {
    padding: 15, // Increased from 12 to 15
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6, // Increased from 4 to 6
  },
  productDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10, // Increased from 8 to 10
  },
  productBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10, // Increased from 8 to 10
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  addToCartButton: {
    position: 'absolute',
    bottom: 15, // Increased from 12 to 15
    right: 15, // Increased from 12 to 15
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 12, // Increased from 10 to 12
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  logoutButton: {
    backgroundColor: '#FF4444',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  noProductsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noProductsText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  clearSearchButton: {
    marginTop: 15,
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  clearSearchText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },

  noCategoriesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  noCategoriesText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  bannerImageStyle: {
    width: '100%',
    height: '100%',
  },
});

export default DashboardScreen; 