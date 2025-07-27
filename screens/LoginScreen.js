import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { API_URLS } from '../config/api';
import { testApiConnection, getCurrentApiUrl, testLoginEndpoint, getNetworkInfo } from '../utils/networkUtils';

const LoginScreen = ({ navigation }) => {
  const [role, setRole] = useState('Consumer');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const roles = ['Superseller', 'Producer', 'Wholeseller', 'Consumer'];

  const showToast = (type, title, message) => {
    Toast.show({
      type: type, // 'success', 'error', 'info'
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 50,
    });
  };

  const handleLogin = async () => {
    // Validate required fields
    if (!phoneNumber || !password) {
      showToast('error', 'Validation Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    // First, test the connection before attempting login
    try {
      const connectionResult = await testApiConnection();
      if (!connectionResult.success) {
        showToast('error', 'Connection Failed', 'Cannot reach the server. Please check if your backend server is running and try again.');
        setLoading(false);
        return;
      }
    } catch (connectionError) {
      console.error('Connection test failed:', connectionError);
      showToast('error', 'Connection Failed', 'Cannot reach the server. Please check if your backend server is running and try again.');
      setLoading(false);
      return;
    }
    
    try {
      const loginData = {
        phone: phoneNumber,
        password: password,
        role: role.toLowerCase(), // Convert to lowercase to match your DB
      };

      console.log('Sending login data:', loginData);
      console.log('API URL:', API_URLS.LOGIN);

      // Add timeout to prevent infinite loading
      const timeoutDuration = 15000; // 15 seconds (increased from 10)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);

      const response = await axios.post(API_URLS.LOGIN, loginData, {
        signal: controller.signal,
        timeout: timeoutDuration,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);
      
      console.log('Login response:', response.data);
      
      // Check if login was successful
      if (response.data.message === 'Login successful') {
        showToast('success', 'Login Successful!', 'Please enter the OTP sent to your phone number.');
        
        // Navigate to OTP screen after a short delay
        setTimeout(() => {
          navigation.navigate('OTP', { 
            userId: response.data.user?._id,
            phoneNumber: phoneNumber,
            userData: response.data.user, // Pass full user data
            token: response.data.token // Pass authentication token
          });
        }, 1500);
      } else {
        showToast('error', 'Login Failed', response.data.message || 'Invalid credentials');
        clearFormFields();
      }
      
    } catch (error) {
      console.error('Login error:', error);
      
      let errorTitle = 'Login Error';
      let errorMessage = 'Login failed. Please check your credentials.';
      
      // Handle CanceledError specifically
      if (error.name === 'CanceledError' || error.message.includes('canceled')) {
        errorTitle = 'Request Canceled';
        errorMessage = 'Login request was canceled. This usually happens when the server is unreachable. Please check your internet connection and ensure the backend server is running.';
      } else if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
        errorTitle = 'Connection Timeout';
        errorMessage = 'Request timed out. Please check your internet connection and try again.';
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        errorTitle = 'Network Error';
        errorMessage = 'Cannot connect to server. Please check your internet connection and try again.';
      } else if (error.code === 'ECONNREFUSED') {
        errorTitle = 'Server Unreachable';
        errorMessage = 'Cannot connect to server. Please ensure your backend server is running on port 4000.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorTitle = 'Authentication Failed';
        errorMessage = 'Invalid phone number or password. Please check your credentials.';
      } else if (error.response?.status === 404) {
        errorTitle = 'User Not Found';
        errorMessage = 'User not found. Please check your phone number and role.';
      } else if (error.response?.status === 0) {
        errorTitle = 'Server Unavailable';
        errorMessage = 'Cannot connect to server. Please check if the server is running.';
      } else if (error.response?.status >= 500) {
        errorTitle = 'Server Error';
        errorMessage = 'Server is experiencing issues. Please try again later.';
      }
      
      showToast('error', errorTitle, errorMessage);
      clearFormFields();
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleRememberMe = () => {
    setRememberMe(!rememberMe);
  };

  const selectRole = (selectedRole) => {
    setRole(selectedRole);
    setShowRoleDropdown(false);
  };

  const clearFormFields = () => {
    setPhoneNumber('');
    setPassword('');
  };

  const testConnection = async () => {
    showToast('info', 'Testing Connection', 'Checking API server connectivity...');
    
    // Log network info
    const networkInfo = getNetworkInfo();
    console.log('Network Info:', networkInfo);
    
    // Test basic connection
    const connectionResult = await testApiConnection();
    console.log('Connection test result:', connectionResult);
    
    if (connectionResult.success) {
      showToast('success', 'Connection Successful', 'API server is reachable');
      
      // Test login endpoint specifically
      const loginResult = await testLoginEndpoint();
      console.log('Login endpoint test result:', loginResult);
      
      if (loginResult.success) {
        showToast('success', 'Login Endpoint OK', 'Login API is working correctly');
      } else {
        showToast('warning', 'Login Endpoint Issue', `Login API error: ${loginResult.error}`);
      }
    } else {
      let errorMessage = `Cannot reach server: ${connectionResult.error}`;
      
      if (connectionResult.code === 'ECONNREFUSED') {
        errorMessage = 'Server refused connection. Check if backend is running and listening on all interfaces.';
      } else if (connectionResult.code === 'ENOTFOUND') {
        errorMessage = 'Server not found. Check IP address and network connection.';
      } else if (connectionResult.code === 'ECONNABORTED') {
        errorMessage = 'Connection timeout. Server might be slow or unreachable.';
      }
      
      showToast('error', 'Connection Failed', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Text style={styles.signinText}>Signin</Text>
          <Text style={styles.timeText}>09:25 PM</Text>
        </View>
        <View style={styles.statusBar}>
          <Ionicons name="wifi" size={16} color="#333" />
          <Ionicons name="cellular" size={16} color="#333" />
          <Ionicons name="battery-full" size={16} color="#333" />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Content Card */}
        <View style={styles.contentCard}>
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Welcome Back</Text>
            <Text style={styles.welcomeSubtitle}>Login to access your account</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            {/* Role Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Role<Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.dropdownContainer}
                onPress={() => setShowRoleDropdown(!showRoleDropdown)}
              >
                <TextInput
                  style={styles.dropdownInput}
                  value={role}
                  editable={false}
                />
                <TouchableOpacity style={styles.dropdownIcon}>
                  <Ionicons 
                    name={showRoleDropdown ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#333" 
                  />
                </TouchableOpacity>
              </TouchableOpacity>
              
              {/* Inline Dropdown Options */}
              {showRoleDropdown && (
                <View style={styles.inlineDropdown}>
                  {roles.map((roleOption) => (
                    <TouchableOpacity
                      key={roleOption}
                      style={[
                        styles.roleOption,
                        role === roleOption && styles.selectedRoleOption,
                      ]}
                      onPress={() => selectRole(roleOption)}
                    >
                      <Text
                        style={[
                          styles.roleOptionText,
                          role === roleOption && styles.selectedRoleOptionText,
                        ]}
                      >
                        {roleOption}
                      </Text>
                      {role === roleOption && (
                        <Ionicons name="checkmark" size={16} color="#4CAF50" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Phone Number Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Phone Number<Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your phone number"
                placeholderTextColor="#999"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>

            {/* Password Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Password<Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={togglePasswordVisibility}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#333"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Remember Me and Forgot Password */}
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={styles.rememberMeContainer}
                onPress={toggleRememberMe}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && (
                    <Ionicons name="checkmark" size={14} color="white" />
                  )}
                </View>
                <Text style={styles.rememberMeText}>Remember me</Text>
              </TouchableOpacity>
              
              <TouchableOpacity>
                <Text style={styles.forgotPasswordText}>Forget password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity 
              style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>Log In</Text>
              )}
            </TouchableOpacity>

            {/* Create Account Link */}
            <View style={styles.createAccountContainer}>
              <Text style={styles.createAccountText}>
                Don't have an account?{' '}
                <Text 
                  style={styles.createAccountLink}
                  onPress={() => navigation.navigate('Register')}
                >
                  Create an account
                </Text>
              </Text>
            </View>

            {/* Debug Button - Remove this in production */}
            <TouchableOpacity 
              style={styles.debugButton} 
              onPress={testConnection}
            >
              <Text style={styles.debugButtonText}>Test API Connection</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Toast />

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
    paddingBottom: 20,
  },
  topBarLeft: {
    flexDirection: 'column',
  },
  signinText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  contentCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  welcomeSection: {
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  formSection: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  required: {
    color: '#ff4444',
  },
  dropdownContainer: {
    position: 'relative',
  },
  dropdownInput: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  dropdownIcon: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  textInput: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingRight: 50,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  rememberMeText: {
    fontSize: 14,
    color: '#333',
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#333',
    textDecorationLine: 'underline',
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#ccc',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  createAccountContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  createAccountText: {
    fontSize: 14,
    color: '#333',
  },
  createAccountLink: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  // Inline Dropdown Styles
  inlineDropdown: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedRoleOption: {
    backgroundColor: '#f0f8f0',
  },
  roleOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedRoleOptionText: {
    fontWeight: '600',
    color: '#4CAF50',
  },
  debugButton: {
    backgroundColor: '#007bff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  debugButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoginScreen;