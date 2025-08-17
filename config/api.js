// API Configuration
import { Platform } from 'react-native';

// Prefer environment-aware defaults to reduce network errors
// - Android emulator uses 10.0.2.2 to access host machine
// - iOS simulator can use localhost
// - Physical devices must use your computer's LAN IP
const LAN_IP = '192.168.0.100'; // Update if your PC's IP changes
// Emulator default (10.0.2.2). Set to true only when testing on a physical Android device.
const FORCE_LAN_ON_ANDROID = false;
const getBaseUrl = () => {
  // Prefer LAN for reliability across device/emulator
  if (Platform.OS === 'android') {
    return FORCE_LAN_ON_ANDROID ? `http://${LAN_IP}:4000` : 'http://10.0.2.2:4000';
  }
  if (Platform.OS === 'ios') return 'http://localhost:4000';
  return `http://${LAN_IP}:4000`;
};

const API_CONFIG = {
  // You can override this to a fixed LAN URL if testing on a physical device
  BASE_URL: getBaseUrl(),
  
  // Alternative configurations for different setups
  // BASE_URL: 'http://10.0.2.2:4000', // Android emulator localhost
  // BASE_URL: 'http://localhost:4000', // Only works on same device
  // BASE_URL: 'http://127.0.0.1:4000', // Localhost alternative
  
  // Production (when you deploy)
  // BASE_URL: 'https://your-production-domain.com',
  
  // API Endpoints
  ENDPOINTS: {
    REGISTER: '/api/v1/register',
    LOGIN: '/api/v1/login',
    VERIFY_OTP: '/api/v1/verify-otp',
    LOGOUT: '/api/v1/logout',
    GET_PROFILE: '/api/v1/profile',
    UPDATE_PROFILE: '/api/v1/profile',
    UPLOAD_IMAGE: '/api/v1/upload-image',
    UPDATE_PROFILE_IMAGE: '/api/v1/profile/image',
    PROFILE_IMAGE: '/api/v1/profile/image',
    PRODUCTS: '/api/v1/products',
    PRODUCT_DETAILS: '/api/v1/products',
    CATEGORIES: '/api/v1/products/categories',
    CREATE_REVIEW: '/api/v1/reviews/create-review',
    GET_REVIEWS: '/api/v1/reviews/get-review',
    GET_USER_REVIEWS: '/api/v1/reviews/user-review',
    ADD_PRODUCT: '/api/v1/producer/add-product',
    
    ADD_TO_WISHLIST: '/api/v1/wishlist/add',
    GET_WISHLIST: '/api/v1/wishlist/',
    REMOVE_FROM_WISHLIST: '/api/v1/wishlist',

    ADD_TO_CART: '/api/v1/addToCart/add',
    UPDATE_CART_QUANTITY: '/api/v1/addToCart/update',
    GET_CART: '/api/v1/addToCart',
    DELETE: '/api/v1/addToCart/remove',
    REMOVE_FROM_CART: '/api/v1/addToCart/remove',
    
    CREATE_ORDER: '/api/v1/order/create',
    GET_ORDERS: '/api/v1/order',
    GET_ORDER_DETAILS: '/api/v1/order',
    UPDATE_ORDER_STATUS: '/api/v1/order/status',
    CANCEL_ORDER: '/api/v1/order/cancel',
    PAYMENTS_BASE: '/api/v1/payments',
    INITIATE_COD: '/api/v1/payments/initiate-cod',
    PAYMENT_DETAILS: '/api/v1/payments',
    UPDATE_PAYMENT_STATUS: '/api/v1/payments',
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Export endpoints for easy access
export const API_URLS = {
  REGISTER: getApiUrl(API_CONFIG.ENDPOINTS.REGISTER),
  LOGIN: getApiUrl(API_CONFIG.ENDPOINTS.LOGIN),
  VERIFY_OTP: getApiUrl(API_CONFIG.ENDPOINTS.VERIFY_OTP),
  LOGOUT: getApiUrl(API_CONFIG.ENDPOINTS.LOGOUT),
  GET_PROFILE: getApiUrl(API_CONFIG.ENDPOINTS.GET_PROFILE),
  UPDATE_PROFILE: getApiUrl(API_CONFIG.ENDPOINTS.UPDATE_PROFILE),
  UPLOAD_IMAGE: getApiUrl(API_CONFIG.ENDPOINTS.UPLOAD_IMAGE),
  UPDATE_PROFILE_IMAGE: getApiUrl(API_CONFIG.ENDPOINTS.UPDATE_PROFILE_IMAGE),
  PROFILE_IMAGE: getApiUrl(API_CONFIG.ENDPOINTS.PROFILE_IMAGE),
  PRODUCTS: getApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS),
  PRODUCT_DETAILS: getApiUrl(API_CONFIG.ENDPOINTS.PRODUCT_DETAILS),
  CATEGORIES: getApiUrl(API_CONFIG.ENDPOINTS.CATEGORIES),
  CREATE_REVIEW: getApiUrl(API_CONFIG.ENDPOINTS.CREATE_REVIEW),
  GET_REVIEWS: getApiUrl(API_CONFIG.ENDPOINTS.GET_REVIEWS),
  GET_USER_REVIEWS: getApiUrl(API_CONFIG.ENDPOINTS.GET_USER_REVIEWS),
  ADD_PRODUCT: getApiUrl(API_CONFIG.ENDPOINTS.ADD_PRODUCT),
  // Wishlist URLs
  ADD_TO_WISHLIST: getApiUrl(API_CONFIG.ENDPOINTS.ADD_TO_WISHLIST),
  GET_WISHLIST: getApiUrl(API_CONFIG.ENDPOINTS.GET_WISHLIST),
  REMOVE_FROM_WISHLIST: getApiUrl(API_CONFIG.ENDPOINTS.REMOVE_FROM_WISHLIST),
  // Cart URLs
  ADD_TO_CART: getApiUrl(API_CONFIG.ENDPOINTS.ADD_TO_CART),
  UPDATE_CART_QUANTITY: getApiUrl(API_CONFIG.ENDPOINTS.UPDATE_CART_QUANTITY),
  GET_CART: getApiUrl(API_CONFIG.ENDPOINTS.GET_CART),
  DELETE: getApiUrl(API_CONFIG.ENDPOINTS.DELETE),
  REMOVE_FROM_CART: getApiUrl(API_CONFIG.ENDPOINTS.REMOVE_FROM_CART),
  // Order URLs
  CREATE_ORDER: getApiUrl(API_CONFIG.ENDPOINTS.CREATE_ORDER),
  GET_ORDERS: getApiUrl(API_CONFIG.ENDPOINTS.GET_ORDERS),
  GET_ORDER_DETAILS: getApiUrl(API_CONFIG.ENDPOINTS.GET_ORDER_DETAILS),
  UPDATE_ORDER_STATUS: getApiUrl(API_CONFIG.ENDPOINTS.UPDATE_ORDER_STATUS),
  CANCEL_ORDER: getApiUrl(API_CONFIG.ENDPOINTS.CANCEL_ORDER),
  // Payment URLs
  PAYMENTS_BASE: getApiUrl(API_CONFIG.ENDPOINTS.PAYMENTS_BASE),
  INITIATE_COD: getApiUrl(API_CONFIG.ENDPOINTS.INITIATE_COD),
  PAYMENT_DETAILS: (paymentId) => `${getApiUrl(API_CONFIG.ENDPOINTS.PAYMENT_DETAILS)}/${paymentId}`,
  UPDATE_PAYMENT_STATUS: (paymentId) => `${getApiUrl(API_CONFIG.ENDPOINTS.UPDATE_PAYMENT_STATUS)}/${paymentId}/status`,
};

export default API_CONFIG; 