import React, { useState } from 'react';
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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URLS } from '../config/api';
import { pickImage, imageToBase64, getImageSource } from '../utils/imageUpload';

const PersonalInfoScreen = ({ navigation, route }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profileImage, setProfileImage] = useState(userData?.profileImage || null);
  const { userId, phoneNumber, userData, token } = route.params || {};

  // Form state for editing
  const [formData, setFormData] = useState({
    name: userData?.name || userData?.fullName || '',
    nid: userData?.nid || '',
    phone: userData?.phone || phoneNumber || '',
    email: userData?.email || '',
    division: userData?.division || '',
    district: userData?.district || '',
    address: userData?.address || '',
  });

  // Fetch user profile data
  const fetchUserProfile = async () => {
    setProfileLoading(true);
    try {
      const response = await axios.get(API_URLS.GET_PROFILE, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Check for success in different possible response formats
      const isSuccess = response.data.success || 
                       response.data.status === 'success' || 
                       response.status === 200;
      
      if (isSuccess) {
        const profileData = response.data.data || response.data.user || response.data;
        
        console.log('Fetched profile data:', {
          name: profileData.name,
          image: profileData.image ? 'Image present' : 'No image',
          profileImage: profileData.profileImage ? 'ProfileImage present' : 'No profileImage',
          imageUrl: profileData.image,
          profileImageUrl: profileData.profileImage
        });
        
        setFormData({
          name: profileData.name || profileData.fullName || '',
          nid: profileData.nid || '',
          phone: profileData.phone || phoneNumber || '',
          email: profileData.email || '',
          division: profileData.division || '',
          district: profileData.district || '',
          address: profileData.address || '',
        });
        
        // Update profile image if available - prioritize 'image' field from database
        if (profileData.image) {
          console.log('Setting profile image from database:', profileData.image);
          setProfileImage(profileData.image);
        } else if (profileData.profileImage) {
          console.log('Setting profile image from profileImage field:', profileData.profileImage);
          setProfileImage(profileData.profileImage);
        }
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
      // If API fails, use the data passed from route params
    } finally {
      setProfileLoading(false);
    }
  };

  // Fetch profile data when component mounts
  React.useEffect(() => {
    if (token) {
      fetchUserProfile();
    }
  }, [token]);

  // Update form data when userData changes
  React.useEffect(() => {
    if (userData) {
      setFormData({
        name: userData?.name || userData?.fullName || '',
        nid: userData?.nid || '',
        phone: userData?.phone || phoneNumber || '',
        email: userData?.email || '',
        division: userData?.division || '',
        district: userData?.district || '',
        address: userData?.address || '',
      });
      setProfileImage(userData?.profileImage || null);
    }
  }, [userData]);

  // Handle profile picture upload
  const handleProfileImageUpload = async () => {
    try {
      setUploadingImage(true);
      
      // Show image picker options
      Alert.alert(
        'Choose Photo',
        'Select a photo from your gallery or take a new one',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Gallery',
            onPress: () => uploadImage('gallery'),
          },
          {
            text: 'Camera',
            onPress: () => uploadImage('camera'),
          },
        ]
      );
    } catch (error) {
      console.error('Error handling profile image upload:', error);
      Alert.alert('Error', 'Failed to upload profile picture');
    } finally {
      setUploadingImage(false);
    }
  };

  const uploadImage = async (source) => {
    try {
      setUploadingImage(true);
      
      // Pick image
      const imageData = await pickImage(source);
      
      if (!imageData) {
        setUploadingImage(false);
        return;
      }

      console.log('Uploading image to dedicated endpoint:', {
        userId: userId,
        imageType: imageData.type,
        imageName: imageData.name,
        imageUri: imageData.uri
      });
      
      // Use the dedicated image upload endpoint with FormData
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('image', {
        uri: imageData.uri,
        type: imageData.type,
        name: imageData.name
      });
      
      console.log('Sending FormData with image file:', {
        userId: userId,
        imageUri: imageData.uri,
        imageType: imageData.type,
        imageName: imageData.name
      });
      
      const response = await axios.put(API_URLS.PROFILE_IMAGE, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Log the full response for debugging
      console.log('Image upload response:', {
        status: response.status,
        data: response.data,
        success: response.data.success,
        message: response.data.message
      });
      
      // Log the request details for debugging
      console.log('Request details:', {
        url: API_URLS.PROFILE_IMAGE,
        method: 'PUT',
        contentType: 'multipart/form-data',
        formDataKeys: ['userId', 'image']
      });
      
      // Check for success
      const isSuccess = response.data.success || 
                       response.data.status === 'success' || 
                       response.status === 200 || 
                       response.data.message === 'Profile picture uploaded successfully';

      if (isSuccess) {
        // Get the uploaded image URL from the response
        const uploadedImageUrl = response.data.user?.image || response.data.data?.image;
        
        console.log('Upload successful, image URL:', uploadedImageUrl);
        
        // Update local state with the actual uploaded image URL
        if (uploadedImageUrl) {
          setProfileImage(uploadedImageUrl);
        } else {
          // Fallback to local URI if server URL not available
          setProfileImage(imageData.uri);
        }
        
        // Update userData in navigation params
        const updatedUserData = { ...userData, image: uploadedImageUrl || imageData.uri };
        navigation.setParams({ userData: updatedUserData });
        
        // Update parent navigation if exists
        if (navigation.getParent()) {
          navigation.getParent().setParams({ userData: updatedUserData });
        }
        
        // Refresh profile data from server to ensure consistency
        await fetchUserProfile();
        
        Alert.alert('Success', 'Profile picture updated successfully!');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to upload profile picture');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      let errorMessage = 'Failed to upload profile picture. Please try again.';
      
      if (error.message.includes('permission')) {
        errorMessage = 'Permission denied. Please allow camera/gallery access.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 413) {
        errorMessage = 'Image file is too large. Please choose a smaller image.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid image format. Please choose a valid image file.';
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const response = await axios.put(API_URLS.UPDATE_PROFILE, {
        ...formData
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Check for success in different possible response formats
      const isSuccess = response.data.success || 
                       response.data.status === 'success' || 
                       response.status === 200 || 
                       response.data.message === 'Profile updated successfully';
      
      // Log the response for debugging
      console.log('API Response:', response.data);
      console.log('Response Status:', response.status);
      
      if (isSuccess) {
        Alert.alert('Success', 'Personal information updated successfully!');
        setIsEditing(false);
        
        // Immediately update the local state with new data
        const updatedUserData = { ...userData, ...formData };
        
        // Update the userData in route params immediately
        navigation.setParams({
          userData: updatedUserData
        });
        
        // Also update the parent screen's userData if it exists
        if (navigation.getParent()) {
          navigation.getParent().setParams({
            userData: updatedUserData
          });
        }
        
        // Refresh profile data from API to ensure consistency
        await fetchUserProfile();
        
        // Force a re-render by updating the form data
        setFormData(prevData => ({
          ...prevData,
          ...formData
        }));
        
      } else {
        Alert.alert('Error', response.data.message || 'Failed to update personal information');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      let errorMessage = 'Failed to update personal information. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderInputField = (label, value, key, placeholder, keyboardType = 'default') => (
    <View style={styles.inputField}>
      <Text style={styles.inputLabel}>{label}</Text>
      {isEditing ? (
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={(text) => setFormData({ ...formData, [key]: text })}
          placeholder={placeholder}
          keyboardType={keyboardType}
          placeholderTextColor="#999"
        />
      ) : (
        <Text style={styles.inputValue}>{value || 'Not provided'}</Text>
      )}
    </View>
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

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Information</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {profileLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Loading personal information...</Text>
          </View>
        ) : (
          <>
            {/* Profile Image Section */}
            <View style={styles.profileImageSection}>
              <View style={styles.profileImageContainer}>
                {profileImage ? (
                  <Image source={getImageSource(profileImage)} style={styles.profileImage} />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <Ionicons name="person" size={40} color="#4CAF50" />
                  </View>
                )}
                <TouchableOpacity 
                  style={styles.editImageButton}
                  onPress={handleProfileImageUpload}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Ionicons name="pencil" size={16} color="white" />
                  )}
                </TouchableOpacity>
              </View>
              <Text style={styles.userName}>{formData.name || 'User Name'}</Text>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Personal Information</Text>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setIsEditing(!isEditing)}
                >
                  <Text style={styles.editButtonText}>
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Text>
                </TouchableOpacity>
              </View>
            
            {[
              renderInputField('Name', formData.name, 'name', 'Enter your name'),
              renderInputField('NID', formData.nid, 'nid', 'Enter your NID number'),
              renderInputField('Phone No', formData.phone, 'phone', 'Enter phone number', 'phone-pad'),
              renderInputField('Email', formData.email, 'email', 'Enter your email', 'email-address'),
              renderInputField('Division', formData.division, 'division', 'Enter your division'),
              renderInputField('District', formData.district, 'district', 'Enter your district'),
              renderInputField('Address', formData.address, 'address', 'Enter your address'),
            ].map((field, index) => (
              <View key={`field-${index}`}>
                {field}
              </View>
            ))}
            
            {isEditing && (
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleUpdateProfile}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
          </>
        )}
      </ScrollView>

      {/* Bottom Navigation Footer */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('Dashboard', {
            userId,
            phoneNumber,
            userData,
            token
          })}
        >
          <Ionicons name="home" size={24} color="#666" />
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="cart" size={24} color="#666" />
          <Text style={styles.tabLabel}>Carts</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="heart" size={24} color="#666" />
          <Text style={styles.tabLabel}>Wishlist</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => navigation.navigate('Profile', {
            userId,
            phoneNumber,
            userData,
            token
          })}
        >
          <Ionicons name="person" size={24} color="#4CAF50" />
          <Text style={[styles.tabLabel, styles.activeTabLabel]}>Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#666" />
          <Text style={styles.tabLabel}>More</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
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
  headerRight: {
    width: 34,
  },
  scrollView: {
    flex: 1,
    paddingBottom: 180, // Increased padding for bottom navigation and edit button
  },
  profileImageSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: 'white',
    marginBottom: 15,
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  section: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 30,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  inputField: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  inputValue: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  textInput: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 25, // Add bottom margin for better spacing
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 10,
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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

export default PersonalInfoScreen; 