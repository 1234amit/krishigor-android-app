// API Configuration
const API_CONFIG = {
  // Development - Use your actual IP address
  // For physical device testing, replace with your computer's IP address
  BASE_URL: 'http://192.168.0.100:4000', // Your actual IP address
  
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
    PRODUCTS: '/api/v1/consumer/products',
    PRODUCT_DETAILS: '/api/v1/consumer/products',
    CATEGORIES: '/api/v1/consumer/view-all-category',
    CREATE_REVIEW: '/api/v1/consumer/create-review',
    // Wishlist endpoints
    ADD_TO_WISHLIST: '/api/v1/wishlist/add',
    GET_WISHLIST: '/api/v1/wishlist/',
    REMOVE_FROM_WISHLIST: '/api/v1/wishlist',
    
    ADD_TO_CART: '/api/v1/addToCart/add',
    UPDATE_CART_QUANTITY: '/api/v1/addToCart/update',
    GET_CART: '/api/v1/addToCart',
    DELETE: '/api/v1/addToCart/remove',
    REMOVE_FROM_CART: '/api/v1/addToCart/remove',
    
    CREATE_ORDER: '/api/v1/orders/create',
    GET_ORDERS: '/api/v1/orders',
    GET_ORDER_DETAILS: '/api/v1/orders',
    UPDATE_ORDER_STATUS: '/api/v1/orders/status',
    CANCEL_ORDER: '/api/v1/orders/cancel',
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
};

export default API_CONFIG; 