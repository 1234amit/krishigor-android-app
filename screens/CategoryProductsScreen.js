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
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URLS } from '../config/api';

const CategoryProductsScreen = ({ navigation, route }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState([]);
  const { category, userId, phoneNumber, userData, token } = route.params || {};

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URLS.PRODUCTS, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.products && Array.isArray(response.data.products)) {
        const allProductsData = response.data.products || [];
        setAllProducts(allProductsData);
        
        // Filter products by category
        const filteredProducts = allProductsData.filter(product => {
          const productCategory = product.category || product.categoryName || product.categoryId;
          return productCategory === category.name || 
                 productCategory === category._id ||
                 product.categoryId === category._id;
        });
        
        setProducts(filteredProducts);
      } else {
        console.error('Failed to fetch products:', response.data.message || 'Invalid response format');
        // Fallback to sample products if API fails
        const sampleProducts = getSampleProducts();
        const filteredSampleProducts = sampleProducts.filter(product => 
          product.category === category.name || product.categoryId === category._id
        );
        setProducts(filteredSampleProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error.response?.data || error.message);
      // Fallback to sample products if API fails
      const sampleProducts = getSampleProducts();
      const filteredSampleProducts = sampleProducts.filter(product => 
        product.category === category.name || product.categoryId === category._id
      );
      setProducts(filteredSampleProducts);
    } finally {
      setLoading(false);
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
  ];

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
        <Text style={styles.headerTitle}>{category?.name || 'Category'} Products</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        ) : products.length > 0 ? (
          <FlatList
            data={products}
            renderItem={({ item }) => renderProductCard(item)}
            keyExtractor={(item) => item._id}
            numColumns={2}
            columnWrapperStyle={styles.productRow}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.productList}
          />
        ) : (
          <View style={styles.noProductsContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#ccc" />
            <Text style={styles.noProductsText}>No products found in this category</Text>
            <TouchableOpacity 
              style={styles.backToCategoriesButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backToCategoriesText}>Back to Categories</Text>
            </TouchableOpacity>
          </View>
        )}
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
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  searchButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  productList: {
    padding: 16,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
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
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 11,
    color: '#666',
    marginBottom: 8,
  },
  productBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
  },
  addToCartButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noProductsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  noProductsText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  backToCategoriesButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backToCategoriesText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CategoryProductsScreen; 