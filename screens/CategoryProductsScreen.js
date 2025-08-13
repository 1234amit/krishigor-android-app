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
    console.log('CategoryProductsScreen - Category received:', category);
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching products for category:', category?.name, 'ID:', category?._id);
      
      const response = await axios.get(API_URLS.PRODUCTS, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API Response:', response.data);
      
      if (response.data.products && Array.isArray(response.data.products)) {
        const allProductsData = response.data.products || [];
        setAllProducts(allProductsData);
        
        console.log('Total products received:', allProductsData.length);
        if (allProductsData.length > 0) {
          console.log('Sample product structure:', JSON.stringify(allProductsData[0], null, 2));
        }
        
        // Enhanced category filtering with multiple strategies
        const filteredProducts = allProductsData.filter(product => {
          // Get all possible category fields from the product
          const productCategoryFields = {
            category: product.category,
            categoryName: product.categoryName,
            categoryId: product.categoryId,
            category_id: product.category_id,
            categoryName: product.categoryName,
            // Add any other possible category field names
          };
          
          console.log('Product:', product.productName || product.name);
          console.log('Product category fields:', productCategoryFields);
          console.log('Looking for category:', category?.name, 'or ID:', category?._id);
          
          // Strategy 1: Direct ID match
          if (product.categoryId === category?._id || 
              product.category_id === category?._id ||
              product.category === category?._id) {
            console.log('✅ Matched by ID');
            return true;
          }
          
          // Strategy 2: Direct name match
          if (product.category === category?.name || 
              product.categoryName === category?.name) {
            console.log('✅ Matched by name');
            return true;
          }
          
          // Strategy 3: Case-insensitive name match
          if (typeof product.category === 'string' && 
              typeof category?.name === 'string' && 
              product.category.toLowerCase() === category.name.toLowerCase()) {
            console.log('✅ Matched by case-insensitive name');
            return true;
          }
          
          // Strategy 4: Check if category name contains the product category or vice versa
          if (typeof product.category === 'string' && 
              typeof category?.name === 'string') {
            if (product.category.toLowerCase().includes(category.name.toLowerCase()) ||
                category.name.toLowerCase().includes(product.category.toLowerCase())) {
              console.log('✅ Matched by partial name');
              return true;
            }
          }
          
          console.log('❌ No match found');
          return false;
        });
        
        console.log('Filtered products count:', filteredProducts.length);
        setProducts(filteredProducts);
        
        // If no products found, try to understand why
        if (filteredProducts.length === 0) {
          console.log('🔍 Debugging: No products matched. Let\'s see what we have:');
          allProductsData.forEach((product, index) => {
            console.log(`Product ${index + 1}:`, {
              name: product.productName || product.name,
              category: product.category,
              categoryId: product.categoryId,
              category_id: product.category_id,
              categoryName: product.categoryName
            });
          });
        }
      } else {
        console.error('Failed to fetch products:', response.data.message || 'Invalid response format');
        // Fallback to sample products if API fails
        const sampleProducts = getSampleProducts();
        const filteredSampleProducts = sampleProducts.filter(product => 
          product.category === category?.name || product.categoryId === category?._id
        );
        console.log('Using sample products, filtered count:', filteredSampleProducts.length);
        setProducts(filteredSampleProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error.response?.data || error.message);
      // Fallback to sample products if API fails
      const sampleProducts = getSampleProducts();
      const filteredSampleProducts = sampleProducts.filter(product => 
        product.category === category?.name || product.categoryId === category?._id
      );
      console.log('Using sample products due to error, filtered count:', filteredSampleProducts.length);
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
      price: '45',
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
      price: '25',
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
      price: '30',
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
      price: '35',
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
      price: '10',
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
      price: '60',
      rating: '4.4',
      discount: '18% Off',
      image: null,
      category: 'Farm',
      categoryId: 'farm',
    },
    // Add more sample products for better testing
    {
      _id: '7',
      productName: 'Fresh Potatoes',
      description: 'Organic potatoes from local farms',
      price: '40',
      rating: '4.3',
      discount: '5% Off',
      image: null,
      category: 'Vegetable',
      categoryId: 'vegetable',
    },
    {
      _id: '8',
      productName: 'Brown Rice',
      description: 'Healthy brown rice variety',
      price: '55',
      rating: '4.7',
      discount: '15% Off',
      image: null,
      category: 'Rice',
      categoryId: 'rice',
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

      {/* Debug Info - Remove this in production
      <View style={styles.debugContainer}>
        <Text style={styles.debugText}>Category: {category?.name} (ID: {category?._id})</Text>
        <Text style={styles.debugText}>Total Products: {allProducts.length}</Text>
        <Text style={styles.debugText}>Filtered Products: {products.length}</Text>
        
        <TouchableOpacity 
          style={styles.testButton}
          onPress={() => {
            console.log('🧪 Testing with sample data...');
            const sampleProducts = getSampleProducts();
            const filteredSampleProducts = sampleProducts.filter(product => 
              product.category === category?.name || product.categoryId === category?._id
            );
            console.log('Sample products filtered:', filteredSampleProducts);
            setProducts(filteredSampleProducts);
          }}
        >
          <Text style={styles.testButtonText}>Test with Sample Data</Text>
        </TouchableOpacity>
      </View> */}

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
  debugContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
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
  testButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  testButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CategoryProductsScreen; 