import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { API_URLS } from '../config/api';

const AddProductScreen = ({ navigation, route }) => {
  const { userId, phoneNumber, userData, token } = route.params || {};
  
  const [formData, setFormData] = useState({
    productName: '',
    quantity: '',
    price: '',
    description: '',
    category: '',
    addToSellPost: 'yes',
  });
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [secondaryImages, setSecondaryImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categories, setCategories] = useState([]);
  
  // Function to clear all form data
  const clearForm = () => {
    setFormData({
      productName: '',
      quantity: '',
      price: '',
      description: '',
      category: '',
      addToSellPost: 'yes',
    });
    setSelectedImage(null);
    setSecondaryImages([]);
    setShowCategoryDropdown(false);
  };

  // Categories with their IDs from your API
  const defaultCategories = [
    { id: '687e813a8d81ee0424e95d98', name: 'Grosary new' },
    { id: 'rice', name: 'Rice' },
    { id: 'corn', name: 'Corn' },
    { id: 'vegetable', name: 'Vegetable' },
    { id: 'gar', name: 'Gar' },
    { id: 'agriculture', name: 'Agriculture' },
    { id: 'farm', name: 'Farm' },
    { id: 'fruits', name: 'Fruits' },
    { id: 'dairy', name: 'Dairy' }
  ];

  useEffect(() => {
    fetchCategories();
    requestPermissions();
    clearForm(); // Clear form when component mounts
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera roll permission is required to add images');
      }
    }
  };

  const fetchCategories = async () => {
    try {
      if (token) {
        const response = await axios.get(API_URLS.CATEGORIES, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data.success && response.data.categories) {
          setCategories(response.data.categories);
        } else {
          setCategories(defaultCategories);
        }
      } else {
        setCategories(defaultCategories);
      }
    } catch (error) {
      console.log('Using default categories due to API error:', error.message);
      setCategories(defaultCategories);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const pickImage = async (isSecondary = false) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        if (isSecondary) {
          setSecondaryImages(prev => [...prev, result.assets[0]]);
        } else {
          setSelectedImage(result.assets[0]);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async (isSecondary = false) => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        if (isSecondary) {
          setSecondaryImages(prev => [...prev, result.assets[0]]);
        } else {
          setSelectedImage(result.assets[0]);
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const showImagePickerOptions = (isSecondary = false) => {
    Alert.alert(
      'Select Image',
      'Choose how you want to add an image',
      [
        { text: 'Camera', onPress: () => takePhoto(isSecondary) },
        { text: 'Gallery', onPress: () => pickImage(isSecondary) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const removeSecondaryImage = (index) => {
    setSecondaryImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImage = async (imageUri) => {
    // For now, skip actual image upload since the endpoint doesn't exist
    // Return a placeholder URL instead
    console.log('Image upload skipped - using placeholder URL');
    return `https://via.placeholder.com/300x300/4CAF50/FFFFFF?text=Product+Image`;
  };

  const validateForm = () => {
    if (!formData.productName.trim()) {
      Alert.alert('Error', 'Product name is required');
      return false;
    }
    if (!formData.quantity.trim()) {
      Alert.alert('Error', 'Product quantity is required');
      return false;
    }
    if (!formData.price.trim()) {
      Alert.alert('Error', 'Product price is required');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Product description is required');
      return false;
    }
    if (!formData.category) {
      Alert.alert('Error', 'Please select a category');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      let imageUrl = '';
      let secondaryImageUrls = [];

      // Upload primary image if selected
      if (selectedImage) {
        try {
          imageUrl = await uploadImage(selectedImage.uri);
        } catch (error) {
          console.log('Primary image upload failed, continuing without image');
          // Continue without image instead of stopping the process
          imageUrl = 'https://via.placeholder.com/300x300/4CAF50/FFFFFF?text=Product+Image';
        }
      }

      // Upload secondary images if selected
      if (secondaryImages.length > 0) {
        for (const image of secondaryImages) {
          try {
            const url = await uploadImage(image.uri);
            secondaryImageUrls.push(url);
          } catch (error) {
            console.error('Secondary image upload failed:', error);
            // Add placeholder for failed uploads
            secondaryImageUrls.push('https://via.placeholder.com/300x300/4CAF50/FFFFFF?text=Product+Image');
          }
        }
      }

      // Prepare the request body matching your API structure
      const requestBody = {
        productName: formData.productName.trim(),
        quantity: formData.quantity.trim(),
        price: formData.price.trim(),
        description: formData.description.trim(),
        category: formData.category,
        addToSellPost: formData.addToSellPost,
        image: imageUrl || 'https://example.com/products/default.jpg', // Fallback if no image
        secondaryImages: secondaryImageUrls,
      };

      console.log('=== DEBUG INFO ===');
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('User ID:', userId);
      console.log('User Data:', userData);
      console.log('Request Body:', JSON.stringify(requestBody, null, 2));
      console.log('API URL:', API_URLS.ADD_PRODUCT);
      console.log('==================');

      // Try alternative request format if the first one fails
      let response;
      try {
        response = await axios.post(API_URLS.ADD_PRODUCT, requestBody, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (firstError) {
        console.log('First attempt failed, trying alternative format...');
        
        // Alternative format - some backends expect different field names
        const alternativeBody = {
          name: formData.productName.trim(),
          qty: formData.quantity.trim(),
          price: parseFloat(formData.price.trim()) || 0,
          desc: formData.description.trim(),
          categoryId: formData.category,
          sellPost: formData.addToSellPost === 'yes',
          imageUrl: imageUrl || 'https://example.com/products/default.jpg',
          images: secondaryImageUrls,
        };
        
        console.log('Alternative request body:', JSON.stringify(alternativeBody, null, 2));
        
        response = await axios.post(API_URLS.ADD_PRODUCT, alternativeBody, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }

      console.log('API Response Status:', response.status);
      console.log('API Response Data:', response.data);
      console.log('API Response Headers:', response.headers);

      // Check multiple success conditions since different APIs use different structures
      const isSuccess = response.status === 200 || response.status === 201 || 
                       response.data?.success === true || 
                       response.data?.status === 'success' ||
                       response.data?.message?.toLowerCase().includes('success') ||
                       !response.data?.error;

      if (isSuccess) {
        console.log('Product added successfully!');
        
        // Reset form immediately
        clearForm();
        
        // Show success message
        Alert.alert(
          'Success! 🎉',
          'Product added successfully to your database',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.goBack();
              },
            },
          ]
        );
      } else {
        console.log('API returned error response');
        const errorMessage = response.data?.message || 
                           response.data?.error || 
                           'Failed to add product to database';
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      let errorMessage = 'Failed to add product. Please try again.';
      
      if (error.response?.status === 500) {
        errorMessage = 'Server Error (500): Your backend server crashed. Check your backend logs for details.';
        console.error('500 Server Error Details:', error.response.data);
      } else if (error.response?.status === 400) {
        errorMessage = `Bad Request (400): ${error.response.data?.message || 'Invalid data sent to server'}`;
      } else if (error.response?.status === 401) {
        errorMessage = 'Unauthorized (401): Please login again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Forbidden (403): You don\'t have permission to add products.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Not Found (404): API endpoint not found.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
        <Text style={styles.headerTitle}>Add New Product</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Product Image Section */}
        <View style={styles.imageSection}>
          <Text style={styles.sectionTitle}>Primary Product Image</Text>
          <TouchableOpacity 
            style={styles.imagePickerButton}
            onPress={() => showImagePickerOptions(false)}
          >
            {selectedImage ? (
              <View style={styles.selectedImageContainer}>
                <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
                <Text style={styles.changeImageText}>Tap to change image</Text>
              </View>
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera" size={40} color="#ccc" />
                <Text style={styles.imagePlaceholderText}>Add Primary Image</Text>
                <Text style={styles.imagePlaceholderSubtext}>Tap to select from gallery or camera</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Secondary Images Section */}
        <View style={styles.imageSection}>
          <Text style={styles.sectionTitle}>Secondary Images (Optional)</Text>
          <TouchableOpacity 
            style={styles.imagePickerButton}
            onPress={() => showImagePickerOptions(true)}
          >
            <View style={styles.imagePlaceholder}>
              <Ionicons name="images" size={40} color="#ccc" />
              <Text style={styles.imagePlaceholderText}>Add Secondary Images</Text>
              <Text style={styles.imagePlaceholderSubtext}>Tap to add more images</Text>
            </View>
          </TouchableOpacity>
          
          {/* Display selected secondary images */}
          {secondaryImages.length > 0 && (
            <View style={styles.secondaryImagesContainer}>
              <Text style={styles.secondaryImagesTitle}>Selected Images:</Text>
              <View style={styles.secondaryImagesGrid}>
                {secondaryImages.map((image, index) => (
                  <View key={index} style={styles.secondaryImageItem}>
                    <Image source={{ uri: image.uri }} style={styles.secondaryPreviewImage} />
                    <TouchableOpacity 
                      style={styles.removeImageButton}
                      onPress={() => removeSecondaryImage(index)}
                    >
                      <Ionicons name="close-circle" size={20} color="#FF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Product Details Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Product Details</Text>
          
          {/* Product Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Product Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Apple Gala"
              value={formData.productName}
              onChangeText={(text) => updateFormData('productName', text)}
            />
          </View>

          {/* Quantity with Unit */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Quantity with Unit *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., 5kg, 10 pieces, 2 liters"
              value={formData.quantity}
              onChangeText={(text) => updateFormData('quantity', text)}
            />
          </View>

          {/* Price */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Price (৳) *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., 1200"
              value={formData.price}
              onChangeText={(text) => updateFormData('price', text)}
              keyboardType="numeric"
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="e.g., Freshly imported apples from New Zealand."
              value={formData.description}
              onChangeText={(text) => updateFormData('description', text)}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Category */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Category *</Text>
            <TouchableOpacity
              style={styles.categorySelector}
              onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              <Text style={[
                styles.categorySelectorText,
                !formData.category && styles.placeholderText
              ]}>
                {formData.category ? categories.find(c => c.id === formData.category)?.name : 'Select a category'}
              </Text>
              <Ionicons 
                name={showCategoryDropdown ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
            
            {showCategoryDropdown && (
              <View style={styles.categoryDropdown}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.categoryOption}
                    onPress={() => {
                      updateFormData('category', category.id);
                      setShowCategoryDropdown(false);
                    }}
                  >
                    <Text style={styles.categoryOptionText}>{category.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Add to Sell Post */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Add to Sell Post</Text>
            <View style={styles.radioContainer}>
              <TouchableOpacity
                style={[
                  styles.radioButton,
                  formData.addToSellPost === 'yes' && styles.radioButtonActive
                ]}
                onPress={() => updateFormData('addToSellPost', 'yes')}
              >
                <View style={[
                  styles.radioCircle,
                  formData.addToSellPost === 'yes' && styles.radioCircleActive
                ]} />
                <Text style={styles.radioText}>Yes</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.radioButton,
                  formData.addToSellPost === 'no' && styles.radioButtonActive
                ]}
                onPress={() => updateFormData('addToSellPost', 'no')}
              >
                <View style={[
                  styles.radioCircle,
                  formData.addToSellPost === 'no' && styles.radioCircleActive
                ]} />
                <Text style={styles.radioText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <Text style={styles.infoText}>
            💡 Note: Images will use placeholder URLs for now. You can still add products successfully to your database.
          </Text>
          
          {/* Clear Form Button */}
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearForm}
          >
            <Ionicons name="refresh" size={20} color="#666" />
            <Text style={styles.clearButtonText}>Clear Form</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text style={styles.submitButtonText}>Add Product to Database</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
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
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  imageSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  imagePickerButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginTop: 10,
  },
  imagePlaceholderSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
  selectedImageContainer: {
    alignItems: 'center',
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 10,
  },
  changeImageText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  secondaryImagesContainer: {
    marginTop: 15,
  },
  secondaryImagesTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 10,
  },
  secondaryImagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  secondaryImageItem: {
    position: 'relative',
  },
  secondaryPreviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  formSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categorySelector: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categorySelectorText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  categoryDropdown: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    maxHeight: 200,
  },
  categoryOption: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryOptionText: {
    fontSize: 16,
    color: '#333',
  },
  radioContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioButtonActive: {
    // Active state styling
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  radioCircleActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF50',
  },
  radioText: {
    fontSize: 16,
    color: '#333',
  },
  submitSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  clearButtonText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
});

export default AddProductScreen;
