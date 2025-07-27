import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

// Request camera and media library permissions
export const requestPermissions = async () => {
  const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
  const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
  return {
    camera: cameraStatus === 'granted',
    mediaLibrary: mediaLibraryStatus === 'granted'
  };
};

// Pick image from camera or gallery
export const pickImage = async (source = 'gallery') => {
  try {
    const permissions = await requestPermissions();
    
    if (!permissions.mediaLibrary && source === 'gallery') {
      throw new Error('Media library permission is required');
    }
    
    if (!permissions.camera && source === 'camera') {
      throw new Error('Camera permission is required');
    }

    const options = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio for profile picture
      quality: 0.5, // Reduced quality for smaller file size
      maxWidth: 300, // Reduced max width
      maxHeight: 300, // Reduced max height
    };

    let result;
    
    if (source === 'camera') {
      result = await ImagePicker.launchCameraAsync(options);
    } else {
      result = await ImagePicker.launchImageLibraryAsync(options);
    }

    if (!result.canceled && result.assets && result.assets[0]) {
      return {
        uri: result.assets[0].uri,
        type: 'image/jpeg',
        name: 'profile-picture.jpg'
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error picking image:', error);
    throw error;
  }
};

// Convert image to base64
export const imageToBase64 = async (imageUri) => {
  try {
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
};

// Compress image if needed
export const compressImage = async (imageUri, maxSize = 500) => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(imageUri);
    
    if (fileInfo.size > maxSize * 1024) { // If larger than maxSize KB
      // For now, we'll use the original image
      // In a production app, you might want to use a compression library
      return imageUri;
    }
    
    return imageUri;
  } catch (error) {
    console.error('Error compressing image:', error);
    return imageUri;
  }
};

// Get image source for display (handles both local URIs and base64 data)
export const getImageSource = (imageData) => {
  if (!imageData) {
    return null;
  }
  
  // If it's already a local URI (starts with file:// or content://)
  if (typeof imageData === 'string' && (imageData.startsWith('file://') || imageData.startsWith('content://'))) {
    return { uri: imageData };
  }
  
  // If it's base64 data (starts with data:image)
  if (typeof imageData === 'string' && imageData.startsWith('data:image')) {
    return { uri: imageData };
  }
  
  // If it's just base64 string without prefix, add the prefix
  if (typeof imageData === 'string' && !imageData.startsWith('data:') && !imageData.startsWith('file://') && !imageData.startsWith('content://')) {
    return { uri: `data:image/jpeg;base64,${imageData}` };
  }
  
  // If it's an object with uri property
  if (typeof imageData === 'object' && imageData.uri) {
    return { uri: imageData.uri };
  }
  
  return null;
}; 