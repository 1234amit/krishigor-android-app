import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const OTPScreen = ({ navigation, route }) => {
  const [otp, setOtp] = useState(['', '', '', '', '']);
  const [timer, setTimer] = useState(119); // 1:59 in seconds
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);
  
  // Get user data from route params
  const { userId, phoneNumber, userData, token } = route.params || {};

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          setCanResend(true);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next input
    if (text && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (canResend) {
      setTimer(119);
      setCanResend(false);
      setOtp(['', '', '', '']);
      // Here you would typically call your API to resend OTP
      Alert.alert('OTP Resent', 'A new OTP has been sent to your phone number.');
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 5) {
      Alert.alert('Error', 'Please enter a valid 5-digit OTP');
      return;
    }

    setLoading(true);
    
    try {
      // Here you would typically verify OTP with your backend
      console.log('Verifying OTP:', otpString, 'for user:', userId);
      
      // For testing purposes, accept "12345" as valid OTP
      // In a real app, you would make an API call like:
      // const response = await axios.post('http://localhost:4000/api/v1/verify-otp', {
      //   userId,
      //   otp: otpString
      // });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if OTP is "12345" for testing
      if (otpString === '12345') {
        console.log('OTP verification successful, navigating to Dashboard...');
        Alert.alert(
          'Success!',
          'OTP verified successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                console.log('Navigating to Dashboard with userId:', userId, 'phoneNumber:', phoneNumber, 'userData:', userData, 'token:', token);
                navigation.navigate('Dashboard', { 
                  userId,
                  phoneNumber,
                  userData,
                  token
                });
              }
            }
          ]
        );
      } else {
        console.log('Invalid OTP entered:', otpString);
        Alert.alert('Error', 'Invalid OTP. Please enter the correct verification code.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      Alert.alert('Error', 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Text style={styles.otpText}>OTP</Text>
          <Text style={styles.timeText}>09:25 PM</Text>
        </View>
        <View style={styles.statusBar}>
          <Ionicons name="wifi" size={16} color="#333" />
          <Ionicons name="cellular" size={16} color="#333" />
          <Ionicons name="battery-full" size={16} color="#333" />
        </View>
      </View>

      {/* Main Content Card */}
      <View style={styles.contentCard}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Enter Verification Code</Text>
          <Text style={styles.subtitle}>
            We have send you <Text style={styles.boldText}>OTP Code</Text> by your phone number
          </Text>
          <Text style={styles.testHint}>
            Test OTP: <Text style={styles.testOtp}>12345</Text>
          </Text>
        </View>

        {/* OTP Input Fields */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={styles.otpInput}
              value={digit}
              onChangeText={(text) => handleOtpChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
              fontSize={24}
              fontWeight="bold"
            />
          ))}
        </View>

        {/* Resend and Timer Section */}
        <View style={styles.resendContainer}>
          <View style={styles.resendLeft}>
            <Text style={styles.resendText}>
              Didn't receive code?{' '}
              <Text 
                style={[styles.resendLink, !canResend && styles.resendLinkDisabled]}
                onPress={handleResend}
              >
                Resend
              </Text>
            </Text>
          </View>
          <View style={styles.timerContainer}>
            <Text style={[styles.timerText, !canResend && styles.timerTextDisabled]}>
              {formatTime(timer)}
            </Text>
          </View>
        </View>

        {/* Verify Button */}
        <TouchableOpacity 
          style={[styles.verifyButton, (!isOtpComplete || loading) && styles.verifyButtonDisabled]}
          onPress={handleVerify}
          disabled={!isOtpComplete || loading}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.verifyButtonText}>Verify Your Account</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
  },
  topBarLeft: {
    flexDirection: 'column',
  },
  otpText: {
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
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#333',
  },
  testHint: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  testOtp: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  otpInput: {
    width: 60,
    height: 60,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
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
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  resendLeft: {
    flex: 1,
  },
  resendText: {
    fontSize: 14,
    color: '#666',
  },
  resendLink: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  resendLinkDisabled: {
    color: '#ccc',
  },
  timerContainer: {
    alignItems: 'flex-end',
  },
  timerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  timerTextDisabled: {
    color: '#ccc',
  },
  verifyButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: '#ccc',
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default OTPScreen;