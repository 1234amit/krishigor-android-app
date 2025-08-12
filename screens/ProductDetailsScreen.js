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
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URLS } from '../config/api';
import { handleNetworkError, retryRequest, showNetworkDiagnostics } from '../utils/networkUtils';

const { width } = Dimensions.get('window');

const ProductDetailsScreen = ({ navigation, route }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [activeBottomTab, setActiveBottomTab] = useState('home');
  const [expandedFaqs, setExpandedFaqs] = useState({});
  const [reviews, setReviews] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    reviewText: '',
  });
  const { productId, userId, phoneNumber, userData, token } = route.params || {};

  // Sample FAQs data
  const faqs = [
    {
      question: "Lorem Ipsum is simply dummy text?",
      answer: "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry."
    },
    {
      question: "Lorem Ipsum is simply dummy text?",
      answer: "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry."
    },
    {
      question: "Lorem Ipsum is simply dummy text?",
      answer: "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry."
    },
    {
      question: "Lorem Ipsum is simply dummy text?",
      answer: "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry."
    },
    {
      question: "Lorem Ipsum is simply dummy text?",
      answer: "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry."
    }
  ];

  // Sample Reviews data
  const sampleReviews = [
    {
      id: 1,
      userName: "Amin Islam",
      rating: 4.8,
      reviewText: "Lorem ipsum is simply dummy text of the printing and typesetting industry.",
      profileImage: null,
      date: "2024-01-15"
    },
    {
      id: 2,
      userName: "Sarwar Islam",
      rating: 4.8,
      reviewText: "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem ipsum is simply dummy text of the printing and typesetting industry.",
      profileImage: null,
      date: "2024-01-14"
    },
    {
      id: 3,
      userName: "Rahul Kumar",
      rating: 4.9,
      reviewText: "Excellent product quality and fast delivery. Highly recommended!",
      profileImage: null,
      date: "2024-01-13"
    },
    {
      id: 4,
      userName: "Fatima Ahmed",
      rating: 4.7,
      reviewText: "Fresh and organic products. Will definitely order again.",
      profileImage: null,
      date: "2024-01-12"
    },
    {
      id: 5,
      userName: "Mohammad Ali",
      rating: 4.6,
      reviewText: "Good service and reasonable prices. Satisfied with the purchase.",
      profileImage: null,
      date: "2024-01-11"
    }
  ];

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
      fetchSimilarProducts();
      // Set sample reviews for now
      setReviews(sampleReviews);
      // Check wishlist status
      checkWishlistStatus();
    }
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await retryRequest(async () => {
        return axios.get(`${API_URLS.PRODUCTS}/${productId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      });
      
      if (response.data.message === 'Product fetched') {
        setProduct(response.data.product);
      } else {
        console.error('Failed to fetch product:', response.data.message);
        Alert.alert('Error', 'Failed to load product details');
      }
    } catch (error) {
      const { message, shouldRetry } = handleNetworkError(error);
      console.error('Error fetching product details:', message);
      
      if (shouldRetry) {
        Alert.alert(
          'Network Error', 
          'Unable to load product details. Please check your connection and try again.',
          [
            { text: 'OK' },
            { text: 'Diagnose Network', onPress: showNetworkDiagnostics }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to load product details');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilarProducts = async () => {
    try {
      const response = await retryRequest(async () => {
        return axios.get(API_URLS.PRODUCTS, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      });
      
      if (response.data.products && Array.isArray(response.data.products)) {
        // Get 4 similar products (excluding current product)
        const similar = (response.data.products || [])
          .filter(p => p._id !== productId)
          .slice(0, 4);
        setSimilarProducts(similar);
      }
    } catch (error) {
      const { message } = handleNetworkError(error);
      console.error('Error fetching similar products:', message);
      // Don't show alert for similar products as it's not critical
    }
  };

  // Wishlist functions
  const checkWishlistStatus = async () => {
    try {
      console.log('Checking wishlist status for productId:', productId);
      const response = await retryRequest(async () => {
        return axios.get(API_URLS.GET_WISHLIST, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      });
      
      console.log('Wishlist API response:', {
        success: response.data.success,
        data: response.data.data,
        dataType: typeof response.data.data,
        isArray: Array.isArray(response.data.data)
      });
      
      if (response.data.success) {
        // Handle nested data structure: data.items
        let wishlistItems = response.data.data || {};
        
        if (wishlistItems.items && Array.isArray(wishlistItems.items)) {
          wishlistItems = wishlistItems.items;
        } else if (Array.isArray(wishlistItems)) {
          // Direct array structure
          wishlistItems = wishlistItems;
        } else {
          console.log('Wishlist data structure not recognized:', wishlistItems);
          setIsWishlisted(false);
          setWishlistId(null);
          return;
        }
        
        console.log('Wishlist items found:', wishlistItems.length);
        
        // Check for product in wishlist with multiple possible structures
        const isInWishlist = wishlistItems.some(item => {
          console.log('Checking item:', item);
          
          // Check different possible product ID locations
          const itemProductId = item.productId || item.product?._id || item.product?.id || item._id || item.id;
          console.log('Comparing:', { itemProductId, productId, match: itemProductId === productId });
          
          return itemProductId === productId;
        });
        
        console.log('Is in wishlist:', isInWishlist);
        setIsWishlisted(isInWishlist);
        
        if (isInWishlist) {
          const wishlistItem = wishlistItems.find(item => {
            const itemProductId = item.productId || item.product?._id || item.product?.id || item._id || item.id;
            return itemProductId === productId;
          });
          setWishlistId(wishlistItem?.id || wishlistItem?._id);
          console.log('Found wishlist item ID:', wishlistItem?.id || wishlistItem?._id);
        }
      } else {
        console.log('Wishlist API response not successful:', response.data);
        setIsWishlisted(false);
        setWishlistId(null);
      }
    } catch (error) {
      const { message } = handleNetworkError(error);
      console.error('Error checking wishlist status:', message);
      setIsWishlisted(false);
      setWishlistId(null);
    }
  };

  const toggleWishlist = async () => {
    try {
      console.log('Toggling wishlist. Current state:', { isWishlisted, wishlistId, productId });
      
      if (isWishlisted) {
        // Remove from wishlist
        console.log('Removing from wishlist with ID:', wishlistId);
        
        // Ensure wishlistId is valid
        if (!wishlistId) {
          console.error('No wishlist ID available for removal');
          Alert.alert('Error', 'Unable to remove from wishlist - ID not found');
          return;
        }
        
        const response = await retryRequest(async () => {
          return axios.delete(`${API_URLS.REMOVE_FROM_WISHLIST}/${wishlistId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        });
        
        console.log('Remove from wishlist response:', response.data);
        
        if (response.data.success) {
          setIsWishlisted(false);
          setWishlistId(null);
          Alert.alert('Success', 'Removed from wishlist');
        } else {
          Alert.alert('Error', response.data.message || 'Failed to remove from wishlist');
        }
      } else {
        // Add to wishlist
        console.log('Adding to wishlist with productId:', productId);
        const response = await retryRequest(async () => {
          return axios.post(API_URLS.ADD_TO_WISHLIST, {
            productId: productId
          }, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        });
        
        console.log('Add to wishlist response:', response.data);
        
        if (response.data.success) {
          setIsWishlisted(true);
          const newWishlistId = response.data.data?.wishlistId || response.data.data?._id;
          console.log('New wishlist ID:', newWishlistId);
          setWishlistId(newWishlistId);
          Alert.alert('Success', 'Added to wishlist');
        } else {
          Alert.alert('Error', response.data.message || 'Failed to add to wishlist');
        }
      }
    } catch (error) {
      const { message, shouldRetry } = handleNetworkError(error);
      console.error('Error toggling wishlist:', message);
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message;
        
        if (errorMessage === 'Product already in wishlist') {
          // Product is already in wishlist, update the UI state
          console.log('Product already in wishlist, updating UI state');
          setIsWishlisted(true);
          
          // Try to get the wishlist ID by checking the wishlist again
          try {
            const wishlistResponse = await axios.get(API_URLS.GET_WISHLIST, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (wishlistResponse.data.success) {
              let wishlistItems = wishlistResponse.data.data || {};
              
              if (wishlistItems.items && Array.isArray(wishlistItems.items)) {
                wishlistItems = wishlistItems.items;
              } else if (Array.isArray(wishlistItems)) {
                wishlistItems = wishlistItems;
              }
              
              if (Array.isArray(wishlistItems)) {
                const wishlistItem = wishlistItems.find(item => {
                  const itemProductId = item.productId || item.product?._id || item.product?.id || item._id || item.id;
                  return itemProductId === productId;
                });
                
                if (wishlistItem) {
                  const wishlistId = wishlistItem.id || wishlistItem._id;
                  setWishlistId(wishlistId);
                  console.log('Found existing wishlist ID:', wishlistId);
                }
              }
            }
          } catch (wishlistError) {
            console.error('Error fetching wishlist for ID:', wishlistError);
          }
          
          Alert.alert('Info', 'Product is already in your wishlist');
        } else {
          Alert.alert('Error', errorMessage || 'Failed to add to wishlist');
        }
      } else {
        Alert.alert('Error', 'Failed to update wishlist');
      }
    }
  };

  const toggleFaq = (faqId) => {
    setExpandedFaqs(prev => ({
      ...prev,
      [faqId]: !prev[faqId]
    }));
  };

  const [submittingReview, setSubmittingReview] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistId, setWishlistId] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);

  const handleAddToCart = async () => {
    console.log('Add to cart button pressed');
    console.log('Token:', token ? 'Present' : 'Missing');
    console.log('Product ID:', productId);
    console.log('API URL:', API_URLS.ADD_TO_CART);
    
    if (!token) {
      Alert.alert('Error', 'Authentication token is missing. Please login again.');
      return;
    }

    if (!productId) {
      Alert.alert('Error', 'Product ID is missing.');
      return;
    }

    setAddingToCart(true);

    try {
      console.log('Adding product to cart:', productId);
      
      const response = await retryRequest(async () => {
        return axios.post(API_URLS.ADD_TO_CART, {
          productId: productId,
          quantity: 1
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      });
      
      console.log('Add to cart response:', response.data);
      console.log('Response status:', response.status);
      console.log('Response success field:', response.data.success);
      console.log('Response message:', response.data.message);
      
      // Check for success in different possible response structures
      if (response.data.success || response.data.message?.includes('success') || response.status === 200) {
        Alert.alert('Success', 'Product added to cart successfully!', [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to cart screen after successful addition
              navigation.navigate('Cart', {
                userId,
                phoneNumber,
                userData,
                token
              });
            }
          }
        ]);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to add to cart');
      }
    } catch (error) {
      const { message, shouldRetry } = handleNetworkError(error);
      console.error('Error adding to cart:', message);
      
      if (shouldRetry) {
        Alert.alert(
          'Network Error', 
          'Unable to add product to cart. Please check your connection and try again.',
          [
            { text: 'OK' },
            { text: 'Diagnose Network', onPress: showNetworkDiagnostics }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to add product to cart');
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewForm.reviewText.trim()) {
      Alert.alert('Error', 'Please write a review');
      return;
    }

    if (reviewForm.reviewText.trim().length < 10) {
      Alert.alert('Error', 'Review must be at least 10 characters long');
      return;
    }

    if (!token) {
      Alert.alert('Error', 'Authentication token is missing. Please login again.');
      return;
    }

    if (!productId) {
      Alert.alert('Error', 'Product ID is missing.');
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'User ID is missing. Please login again.');
      return;
    }

    setSubmittingReview(true);

    try {
      // Use the exact field names that the backend expects (from Postman test)
      const reviewData = {
        userName: userData?.name || userData?.fullName || 'Anonymous',
        rating: parseFloat(reviewForm.rating), // Use parseFloat to match backend expectation
        comment: reviewForm.reviewText.trim(),
        productId: productId
      };

      // Test different possible endpoint variations
      console.log('Testing different endpoint variations...');
      const possibleEndpoints = [
        API_URLS.CREATE_REVIEW,
        API_URLS.CREATE_REVIEW.replace('/create-review', '/review'),
        API_URLS.CREATE_REVIEW.replace('/create-review', '/reviews'),
        API_URLS.CREATE_REVIEW.replace('/consumer/create-review', '/reviews'),
        API_URLS.CREATE_REVIEW.replace('/consumer/create-review', '/consumer/review')
      ];
      
      for (const endpoint of possibleEndpoints) {
        try {
          const testResponse = await axios.get(endpoint, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          console.log(`GET ${endpoint} - Status: ${testResponse.status}`);
        } catch (testError) {
          console.log(`GET ${endpoint} - Error: ${testError.response?.status}`);
        }
      }

      const response = await axios.post(
        API_URLS.CREATE_REVIEW,
        reviewData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.message === 'Review submitted successfully') {
        // Add the new review to the local state
        const newReview = {
          id: response.data.review._id,
          userName: response.data.review.userName,
          rating: response.data.review.rating,
          reviewText: response.data.review.comment,
          profileImage: null,
          date: response.data.review.createdAt
        };

        setReviews(prev => [newReview, ...prev]);
        setReviewForm({ rating: 5, reviewText: '' });
        setShowReviewModal(false);
        Alert.alert('Success', 'Review submitted successfully!');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        url: API_URLS.CREATE_REVIEW,
        requestData: reviewData
      });
      
      // Log the actual response data separately
      if (error.response) {
        console.error('=== BACKEND RESPONSE DETAILS ===');
        console.error('Status:', error.response.status);
        console.error('Status Text:', error.response.statusText);
        console.error('Headers:', error.response.headers);
        console.error('Data:', error.response.data);
        console.error('Data Type:', typeof error.response.data);
        console.error('Data Stringified:', JSON.stringify(error.response.data));
        console.error('================================');
      }
      
      let errorMessage = 'Failed to submit review. Please try again.';
      
      if (error.response?.status === 400) {
        // Handle 400 Bad Request errors
        console.error('=== BACKEND VALIDATION ERROR ===');
        console.error('Status:', error.response.status);
        console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
        console.error('Response Headers:', error.response.headers);
        console.error('Response Text:', error.response.data);
        console.error('Response Type:', typeof error.response.data);
        console.error('================================');
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response?.data?.errors) {
          // Handle validation errors array
          const errorMessages = error.response.data.errors.map(err => err.message || err.msg).join(', ');
          errorMessage = errorMessages;
        } else {
          errorMessage = 'Invalid request data. Please check your input.';
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        errorMessage = `Network error. Cannot connect to server. Please check if backend is running.`;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderProductImage = () => {
    if (!product) return null;

    const images = [product.image, ...(product.secondaryImages || [])].filter(Boolean);
    
    if (images.length === 0) {
      return (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="image" size={80} color="#ccc" />
          <Text style={styles.placeholderText}>No Image Available</Text>
        </View>
      );
    }

    return (
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: images[currentImageIndex] }} 
          style={styles.productImage}
          resizeMode="cover"
        />
        
        {/* Image Navigation Dots */}
        {images.length > 1 && (
          <View style={styles.imageDots}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentImageIndex && styles.activeDot
                ]}
              />
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.imageActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.wishlistButton]}
            onPress={toggleWishlist}
          >
            <Ionicons 
              name={isWishlisted ? "heart" : "heart-outline"} 
              size={20} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderProductInfo = () => {
    if (!product) return null;

    return (
      <View style={styles.productInfo}>
        {/* Tags */}
        <View style={styles.tagsContainer}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Chemical free Product</Text>
          </View>
          <View style={[styles.tag, styles.orangeTag]}>
            <Text style={styles.tagText}>Track Shop Location</Text>
          </View>
        </View>

        {/* Product Title */}
        <Text style={styles.productTitle}>{product.productName}</Text>

        {/* Location */}
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={16} color="#4CAF50" />
          <Text style={styles.locationText}>
            {product.producer?.division ? `Division: ${product.producer.division}` : 'Division: Not available'}
            {product.producer?.district ? `, District: ${product.producer.district}` : ', District: Not available'}
            {product.producer?.thana ? `, Thana: ${product.producer.thana}` : ', Thana: Not available'}
          </Text>
        </View>

        {/* Rating and Price */}
        <View style={styles.ratingPriceContainer}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>4.8</Text>
            <Text style={styles.reviewsText}>(225k+ Reviews)</Text>
          </View>
          <Text style={styles.priceText}>৳{product.price}</Text>
        </View>

        {/* Promo and Delivery */}
        <View style={styles.promoContainer}>
          <TouchableOpacity style={styles.promoButton}>
            <Text style={styles.promoButtonText}>Apply Promo Code</Text>
          </TouchableOpacity>
          <Text style={styles.deliveryText}>Free Delivery</Text>
        </View>
      </View>
    );
  };

  const renderTabContent = () => {
    if (!product) return null;

    switch (activeTab) {
      case 'description':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.descriptionText}>
              {product.description || 'No description available'}
            </Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• Lorem ipsum dolor sit amet</Text>
              <Text style={styles.bulletPoint}>• Consectetur adipiscing elit</Text>
            </View>
          </View>
        );
      case 'reviews':
        return (
          <View style={styles.tabContent}>
            {/* Average Rating Section with Add Review Button */}
            <View style={styles.averageRatingSection}>
              <View style={styles.ratingHeader}>
                <Text style={styles.averageRatingText}>
                  Average Rating: <Text style={styles.averageRatingNumber}>4.8</Text> ratings
                </Text>
                <TouchableOpacity 
                  style={styles.addReviewButton}
                  onPress={() => setShowReviewModal(true)}
                >
                  <Ionicons name="add" size={20} color="#4CAF50" />
                  <Text style={styles.addReviewText}>Add Review</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Reviews List */}
            <ScrollView 
              style={styles.reviewsScrollView}
              showsVerticalScrollIndicator={true}
            >
              {reviews.map((review, index) => (
                <View key={review.id} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewerInfo}>
                      <View style={styles.reviewerAvatar}>
                        {review.profileImage ? (
                          <Image 
                            source={{ uri: review.profileImage }} 
                            style={styles.avatarImage}
                          />
                        ) : (
                          <Ionicons name="person" size={24} color="#4CAF50" />
                        )}
                      </View>
                      <View style={styles.reviewerDetails}>
                        <Text style={styles.reviewerName}>{review.userName}</Text>
                        <View style={styles.reviewRating}>
                          <Ionicons name="star" size={14} color="#FFD700" />
                          <Text style={styles.reviewRatingText}>({review.rating})</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.reviewText}>{review.reviewText}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        );
      case 'faqs':
        return (
          <View style={styles.tabContent}>
            {faqs.map((faq, index) => (
              <View key={index} style={styles.faqItem}>
                <TouchableOpacity 
                  style={styles.faqQuestion}
                  onPress={() => toggleFaq(index)}
                >
                  <Text style={styles.faqQuestionText}>{faq.question}</Text>
                  <TouchableOpacity 
                    style={styles.faqToggleButton}
                    onPress={() => toggleFaq(index)}
                  >
                    <Ionicons 
                      name={expandedFaqs[index] ? "remove" : "add"} 
                      size={20} 
                      color="#4CAF50" 
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
                {expandedFaqs[index] && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        );
      default:
        return null;
    }
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
          navigation.navigate('Cart', {
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

  const renderSimilarProduct = (similarProduct) => (
    <TouchableOpacity 
      key={similarProduct._id} 
      style={styles.similarProductCard}
      onPress={() => navigation.replace('ProductDetails', {
        productId: similarProduct._id,
        userId,
        phoneNumber,
        userData,
        token
      })}
    >
      <View style={styles.similarProductImageContainer}>
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>
            {similarProduct.discount || '20% Off'}
          </Text>
        </View>
        {similarProduct.image ? (
          <Image 
            source={{ uri: similarProduct.image }} 
            style={styles.similarProductImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.similarProductPlaceholder}>
            <Ionicons name="image" size={30} color="#ccc" />
          </View>
        )}
      </View>
      <View style={styles.similarProductInfo}>
        <Text style={styles.similarProductName} numberOfLines={1}>
          {similarProduct.productName}
        </Text>
        <View style={styles.similarProductMeta}>
          <Ionicons name="leaf" size={12} color="#666" />
          <Text style={styles.similarProductPrice}>৳{similarProduct.price}</Text>
        </View>
        <Text style={styles.similarProductDescription} numberOfLines={1}>
          {similarProduct.description}
        </Text>
        <View style={styles.similarProductBottom}>
          <View style={styles.similarProductRating}>
            <Ionicons name="star" size={10} color="#FFD700" />
            <Text style={styles.similarProductRatingText}>4.5</Text>
          </View>
          <TouchableOpacity style={styles.similarProductAddButton}>
            <Ionicons name="add" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ccc" />
        <Text style={styles.errorText}>Product not found</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Details</Text>
        <TouchableOpacity 
          style={styles.networkButton}
          onPress={showNetworkDiagnostics}
        >
          <Ionicons name="wifi" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.scrollContent}>
        {/* Product Image */}
        {renderProductImage()}

        {/* Product Information */}
        {renderProductInfo()}

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'description' && styles.activeTab]}
            onPress={() => setActiveTab('description')}
          >
            <Text style={[styles.tabText, activeTab === 'description' && styles.activeTabText]}>
              Description
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
            onPress={() => setActiveTab('reviews')}
          >
            <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
              Reviews
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'faqs' && styles.activeTab]}
            onPress={() => setActiveTab('faqs')}
          >
            <Text style={[styles.tabText, activeTab === 'faqs' && styles.activeTabText]}>
              FAQs
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {renderTabContent()}

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <View style={styles.similarProductsSection}>
            <Text style={styles.similarProductsTitle}>View Similar Products</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.similarProductsScroll}
            >
              {similarProducts.map(renderSimilarProduct)}
            </ScrollView>
          </View>
        )}
        </View>
      </ScrollView>

      {/* Add to Cart Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[
            styles.addToCartButton,
            addingToCart && styles.addToCartButtonDisabled
          ]}
          onPress={handleAddToCart}
          disabled={addingToCart}
        >
          {addingToCart ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.addToCartText}>Add To Cart</Text>
          )}
        </TouchableOpacity>
      </View>



      {/* Review Form Modal */}
      <Modal
        visible={showReviewModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.reviewModalContent}>
            <View style={styles.reviewModalHeader}>
              <Text style={styles.reviewModalTitle}>Write a Review</Text>
              <TouchableOpacity 
                onPress={() => setShowReviewModal(false)}
                style={styles.closeModalButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            {/* Rating Stars */}
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingLabel}>Your Rating:</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                  >
                    <Ionicons 
                      name={star <= reviewForm.rating ? "star" : "star-outline"} 
                      size={30} 
                      color="#FFD700" 
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Review Text Input */}
            <View style={styles.reviewInputContainer}>
              <Text style={styles.reviewInputLabel}>Your Review:</Text>
              <TextInput
                style={styles.reviewTextInput}
                placeholder="Share your experience with this product..."
                placeholderTextColor="#999"
                value={reviewForm.reviewText}
                onChangeText={(text) => setReviewForm(prev => ({ ...prev, reviewText: text }))}
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              style={[
                styles.submitReviewButton,
                submittingReview && styles.submitReviewButtonDisabled
              ]}
              onPress={handleSubmitReview}
              disabled={submittingReview}
            >
              {submittingReview ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.submitReviewText}>Submit Review</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        {renderBottomTab('home', 'home', 'Home')}
        {renderBottomTab('cart', 'cart', 'Carts')}
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
  headerSpacer: {
    width: 34,
  },
  networkButton: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
    paddingBottom: 80, // Add space for bottom navigation
  },
  scrollContent: {
    paddingBottom: 20,
  },
  imageContainer: {
    position: 'relative',
    height: 300,
    backgroundColor: '#f0f0f0',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  placeholderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  imageDots: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
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
  imageActions: {
    position: 'absolute',
    top: 20,
    right: 20,
    gap: 10,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wishlistButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
  },
  productInfo: {
    padding: 20,
    backgroundColor: 'white',
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  tag: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  orangeTag: {
    backgroundColor: '#FF9800',
  },
  tagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  productTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  ratingPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  priceText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  promoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  promoButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  promoButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  deliveryText: {
    fontSize: 14,
    color: '#F44336',
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  tabContent: {
    padding: 20,
    backgroundColor: 'white',
    minHeight: 200,
  },
  descriptionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 20,
  },
  bulletPoints: {
    gap: 10,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
  },
  similarProductsSection: {
    padding: 20,
    backgroundColor: 'white',
    marginTop: 10,
  },
  similarProductsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  similarProductsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  similarProductCard: {
    width: 160,
    backgroundColor: 'white',
    borderRadius: 12,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  similarProductImageContainer: {
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
  similarProductImage: {
    width: '100%',
    height: 100,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  similarProductPlaceholder: {
    width: '100%',
    height: 100,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  similarProductInfo: {
    padding: 12,
  },
  similarProductName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  similarProductMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  similarProductPrice: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  similarProductDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  similarProductBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  similarProductRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  similarProductRatingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
  },
  similarProductAddButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginBottom: 80,
  },
  addToCartButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  addToCartText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addToCartButtonDisabled: {
    backgroundColor: '#ccc',
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 15,
    fontWeight: '600',
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
  // FAQ Styles
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 15,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 10,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 15,
  },
  faqToggleButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  faqAnswer: {
    marginTop: 15,
    paddingLeft: 5,
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  // Review Styles
  averageRatingSection: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  averageRatingText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  averageRatingNumber: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  reviewsScrollView: {
    maxHeight: 400,
  },
  reviewItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  reviewHeader: {
    marginBottom: 10,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  reviewerDetails: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewRatingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  reviewText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  // Add Review Button
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  addReviewText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  // Review Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  reviewModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  reviewModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  reviewModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeModalButton: {
    padding: 5,
  },
  ratingContainer: {
    marginBottom: 20,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  reviewInputContainer: {
    marginBottom: 20,
  },
  reviewInputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  reviewTextInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitReviewButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
  },
  submitReviewButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitReviewText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProductDetailsScreen; 