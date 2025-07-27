import axios from 'axios';
import { API_URLS } from '../config/api';
import { Alert } from 'react-native';

// Common IP addresses to test for development
const COMMON_DEV_IPS = [
  'http://192.168.0.100:4000', // Your actual IP
  'http://192.168.1.100:4000',
  'http://192.168.1.101:4000',
  'http://192.168.1.102:4000',
  'http://192.168.1.103:4000',
  'http://192.168.1.104:4000',
  'http://192.168.1.105:4000',
  'http://10.0.2.2:4000', // Android emulator
  'http://localhost:4000', // Same device
  'http://127.0.0.1:4000', // Localhost alternative
];

// Test if the API server is reachable
export const testApiConnection = async () => {
  try {
    const baseUrl = API_URLS.LOGIN.replace('/api/v1/login', '');
    console.log('Testing connection to:', baseUrl);
    
    // Try to reach the base URL first (just to check if server is running)
    const response = await axios.get(baseUrl, {
      timeout: 5000,
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.log('Connection test failed:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url
    });
    
    // If we get a 404, it means the server is running but no root endpoint
    // This is actually a good sign - server is reachable
    if (error.response?.status === 404) {
      return { success: true, message: 'Server is reachable (404 on root endpoint is expected)' };
    }
    
    return { 
      success: false, 
      error: error.message,
      status: error.response?.status,
      code: error.code,
      url: error.config?.url
    };
  }
};

// Auto-detect working API URL
export const detectWorkingApiUrl = async () => {
  console.log('Auto-detecting working API URL...');
  
  for (const baseUrl of COMMON_DEV_IPS) {
    try {
      console.log('Testing:', baseUrl);
      const response = await axios.get(baseUrl, {
        timeout: 3000,
      });
      
      if (response.status === 200) {
        console.log('Found working API URL:', baseUrl);
        return { success: true, baseUrl };
      }
    } catch (error) {
      // If we get a 404, it means the server is running but no root endpoint
      // This is actually a good sign - server is reachable
      if (error.response?.status === 404) {
        console.log('Found working API URL (404 on root is expected):', baseUrl);
        return { success: true, baseUrl };
      }
      
      console.log(`Failed to connect to ${baseUrl}:`, error.message);
      continue;
    }
  }
  
  console.log('No working API URL found');
  return { success: false, error: 'No working API URL found' };
};

// Test login endpoint specifically
export const testLoginEndpoint = async () => {
  try {
    console.log('Testing login endpoint:', API_URLS.LOGIN);
    
    const response = await axios.post(API_URLS.LOGIN, {
      phone: 'test',
      password: 'test',
      role: 'consumer'
    }, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return { success: true, data: response.data };
  } catch (error) {
    console.log('Login endpoint test failed:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url
    });
    
    return { 
      success: false, 
      error: error.message,
      status: error.response?.status,
      code: error.code,
      url: error.config?.url
    };
  }
};

// Get current API base URL for debugging
export const getCurrentApiUrl = () => {
  return API_URLS.LOGIN;
};

// Test specific endpoint
export const testEndpoint = async (endpoint) => {
  try {
    const response = await axios.get(endpoint, {
      timeout: 5000,
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      status: error.response?.status,
      code: error.code 
    };
  }
};

// Get network information for debugging
export const getNetworkInfo = () => {
  return {
    baseUrl: API_URLS.LOGIN.replace('/api/v1/login', ''),
    loginUrl: API_URLS.LOGIN,
    userAgent: 'React Native App',
    timestamp: new Date().toISOString()
  };
};

// Enhanced error handler for network requests
export const handleNetworkError = (error, operation = 'API request') => {
  console.error(`${operation} failed:`, error);
  
  let errorMessage = 'Network error occurred. Please try again.';
  let shouldRetry = false;
  
  if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
    errorMessage = 'Cannot connect to server. Please check your internet connection and try again.';
    shouldRetry = true;
  } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
    errorMessage = 'Request timed out. Please try again.';
    shouldRetry = true;
  } else if (error.response?.status === 401) {
    errorMessage = 'Authentication failed. Please login again.';
  } else if (error.response?.status === 403) {
    errorMessage = 'Access denied. Please check your permissions.';
  } else if (error.response?.status === 404) {
    errorMessage = 'Resource not found. Please try again later.';
  } else if (error.response?.status === 500) {
    errorMessage = 'Server error. Please try again later.';
    shouldRetry = true;
  } else if (error.response?.data?.message) {
    errorMessage = error.response.data.message;
  }
  
  return {
    errorMessage,
    shouldRetry,
    originalError: error
  };
};

// Retry mechanism for failed requests
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      const { shouldRetry } = handleNetworkError(error);
      
      if (!shouldRetry || attempt === maxRetries) {
        throw error;
      }
      
      console.log(`Retry attempt ${attempt}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
};

// Show network diagnostic dialog
export const showNetworkDiagnostics = async () => {
  const networkInfo = getNetworkInfo();
  const connectionTest = await testApiConnection();
  const loginTest = await testLoginEndpoint();
  
  const diagnosticInfo = `
Network Diagnostics:
- Base URL: ${networkInfo.baseUrl}
- Connection Test: ${connectionTest.success ? 'SUCCESS' : 'FAILED'}
- Login Test: ${loginTest.success ? 'SUCCESS' : 'FAILED'}
- Error: ${connectionTest.error || 'None'}

Please ensure:
1. Your backend server is running on port 4000
2. You're using the correct IP address in config/api.js
3. Your device/emulator can reach the server
4. No firewall is blocking the connection
  `;
  
  Alert.alert(
    'Network Diagnostics',
    diagnosticInfo,
    [
      { text: 'OK' },
      { 
        text: 'Auto-Detect', 
        onPress: async () => {
          const result = await detectWorkingApiUrl();
          if (result.success) {
            Alert.alert(
              'Working URL Found',
              `Found working API URL: ${result.baseUrl}\n\nPlease update your config/api.js file with this URL.`
            );
          } else {
            Alert.alert('No Working URL', 'Could not find a working API URL. Please check your server configuration.');
          }
        }
      }
    ]
  );
}; 