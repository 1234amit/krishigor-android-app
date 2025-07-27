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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URLS } from '../config/api';

const RegisterScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    role: 'Consumer',
    name: '',
    email: '',
    phone: '',
    password: '',
    nid: '',
    tradeLicense: '',
    division: 'Chattogram',
    district: 'Chandpur',
    address: '',
  });

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showDivisionDropdown, setShowDivisionDropdown] = useState(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const roles = ['Superseller', 'Producer', 'Wholeseller', 'Consumer'];
  const divisions = ['Chattogram', 'Dhaka', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh'];
  const districts = ['Chandpur', 'Comilla', 'Noakhali', 'Feni', 'Lakshmipur'];

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectRole = (selectedRole) => {
    updateFormData('role', selectedRole);
    setShowRoleDropdown(false);
  };

  const selectDivision = (selectedDivision) => {
    updateFormData('division', selectedDivision);
    setShowDivisionDropdown(false);
  };

  const selectDistrict = (selectedDistrict) => {
    updateFormData('district', selectedDistrict);
    setShowDistrictDropdown(false);
  };

  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    }
  };

  const handleRegister = async () => {
    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'password', 'nid', 'tradeLicense', 'address'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      Alert.alert('Error', `Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    setLoading(true);
    
    try {
      const registrationData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        nid: formData.nid,
        division: formData.division,
        district: formData.district,
        address: formData.address,
        tradelicense: formData.tradeLicense,
        role: formData.role.toLowerCase(), // Convert to lowercase to match your DB
        password: formData.password,
      };

      console.log('Sending registration data:', registrationData);

      const response = await axios.post(API_URLS.REGISTER, registrationData);
      
      console.log('Registration response:', response.data);
      
      Alert.alert(
        'Success!',
        'Registration successful! Please login with your credentials.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
      
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 409) {
        errorMessage = 'User already exists with this phone number or email.';
      } else if (error.response?.status === 0) {
        errorMessage = 'Cannot connect to server. Please check if the server is running.';
      }
      
      Alert.alert('Registration Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const renderStep1 = () => (
    <View style={styles.formSection}>
      {/* Role Field */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          Describe Role<Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity
          style={styles.dropdownContainer}
          onPress={() => setShowRoleDropdown(!showRoleDropdown)}
        >
          <TextInput
            style={styles.dropdownInput}
            value={formData.role}
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
        
        {showRoleDropdown && (
          <View style={styles.inlineDropdown}>
            {roles.map((roleOption) => (
              <TouchableOpacity
                key={roleOption}
                style={[
                  styles.roleOption,
                  formData.role === roleOption && styles.selectedRoleOption,
                ]}
                onPress={() => selectRole(roleOption)}
              >
                <Text
                  style={[
                    styles.roleOptionText,
                    formData.role === roleOption && styles.selectedRoleOptionText,
                  ]}
                >
                  {roleOption}
                </Text>
                {formData.role === roleOption && (
                  <Ionicons name="checkmark" size={16} color="#4CAF50" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Name Field */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          Name<Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter your name"
          placeholderTextColor="#999"
          value={formData.name}
          onChangeText={(value) => updateFormData('name', value)}
        />
      </View>

      {/* Email Field */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          Email<Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter your email"
          placeholderTextColor="#999"
          value={formData.email}
          onChangeText={(value) => updateFormData('email', value)}
          keyboardType="email-address"
        />
      </View>

      {/* Phone Field */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          Phone<Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter your phone number"
          placeholderTextColor="#999"
          value={formData.phone}
          onChangeText={(value) => updateFormData('phone', value)}
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
            value={formData.password}
            onChangeText={(value) => updateFormData('password', value)}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color="#333"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* NID Field */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          NID<Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter your NID No"
          placeholderTextColor="#999"
          value={formData.nid}
          onChangeText={(value) => updateFormData('nid', value)}
          keyboardType="numeric"
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.formSection}>
      {/* Trade License Field */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          Trade Licence<Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter your Trade Licence No"
          placeholderTextColor="#999"
          value={formData.tradeLicense}
          onChangeText={(value) => updateFormData('tradeLicense', value)}
        />
      </View>

      {/* Division Field */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          Division<Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity
          style={styles.dropdownContainer}
          onPress={() => setShowDivisionDropdown(!showDivisionDropdown)}
        >
          <TextInput
            style={styles.dropdownInput}
            value={formData.division}
            editable={false}
          />
          <TouchableOpacity style={styles.dropdownIcon}>
            <Ionicons 
              name={showDivisionDropdown ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#333" 
            />
          </TouchableOpacity>
        </TouchableOpacity>
        
        {showDivisionDropdown && (
          <View style={styles.inlineDropdown}>
            {divisions.map((divisionOption) => (
              <TouchableOpacity
                key={divisionOption}
                style={[
                  styles.roleOption,
                  formData.division === divisionOption && styles.selectedRoleOption,
                ]}
                onPress={() => selectDivision(divisionOption)}
              >
                <Text
                  style={[
                    styles.roleOptionText,
                    formData.division === divisionOption && styles.selectedRoleOptionText,
                  ]}
                >
                  {divisionOption}
                </Text>
                {formData.division === divisionOption && (
                  <Ionicons name="checkmark" size={16} color="#4CAF50" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* District Field */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          District<Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity
          style={styles.dropdownContainer}
          onPress={() => setShowDistrictDropdown(!showDistrictDropdown)}
        >
          <TextInput
            style={styles.dropdownInput}
            value={formData.district}
            editable={false}
          />
          <TouchableOpacity style={styles.dropdownIcon}>
            <Ionicons 
              name={showDistrictDropdown ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#333" 
            />
          </TouchableOpacity>
        </TouchableOpacity>
        
        {showDistrictDropdown && (
          <View style={styles.inlineDropdown}>
            {districts.map((districtOption) => (
              <TouchableOpacity
                key={districtOption}
                style={[
                  styles.roleOption,
                  formData.district === districtOption && styles.selectedRoleOption,
                ]}
                onPress={() => selectDistrict(districtOption)}
              >
                <Text
                  style={[
                    styles.roleOptionText,
                    formData.district === districtOption && styles.selectedRoleOptionText,
                  ]}
                >
                  {districtOption}
                </Text>
                {formData.district === districtOption && (
                  <Ionicons name="checkmark" size={16} color="#4CAF50" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Address Field */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          Address<Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.textInput, styles.addressInput]}
          placeholder="Write your address"
          placeholderTextColor="#999"
          value={formData.address}
          onChangeText={(value) => updateFormData('address', value)}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Text style={styles.registerText}>Register</Text>
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
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.headerTitle}>Create Account</Text>
            <Text style={styles.headerSubtitle}>Explore best agro service by this app</Text>
            
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${currentStep === 1 ? 50 : 100}%` }
                  ]} 
                />
              </View>
            </View>
          </View>

          {/* Form Content */}
          {currentStep === 1 ? renderStep1() : renderStep2()}

                      {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              {currentStep === 1 ? (
                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                  <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={[styles.registerButton, loading && styles.buttonDisabled]} 
                  onPress={handleRegister}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={styles.buttonText}>Register</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>

          {/* Footer Link */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              Already have an account?{' '}
              <Text 
                style={styles.footerLink}
                onPress={() => navigation.navigate('Login')}
              >
                Login
              </Text>
            </Text>
          </View>
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
  registerText: {
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
  headerSection: {
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
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
  textInput: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  addressInput: {
    minHeight: 100,
    paddingTop: 14,
    paddingBottom: 14,
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
  buttonContainer: {
    marginTop: 32,
  },
  nextButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  registerButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#333',
  },
  footerLink: {
    color: '#4CAF50',
    fontWeight: '600',
  },
});

export default RegisterScreen;