import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Utility function to validate authentication data
const validateAuthData = (authData) => {
  const { userId, phoneNumber, userData, token } = authData;
  const missing = [];
  
  if (!token) missing.push('token');
  if (!userId) missing.push('userId');
  if (!phoneNumber) missing.push('phoneNumber');
  if (!userData) missing.push('userData');
  
  return {
    isValid: missing.length === 0,
    missing,
    authData
  };
};

const PaymentSuccessScreen = ({ navigation, route }) => {
  const { orderId, userId, phoneNumber, userData, token } = route.params || {};

  // Debug logging to track authentication data
  React.useEffect(() => {
    console.log('PaymentSuccessScreen - Received route params:', {
      orderId,
      userId,
      phoneNumber: phoneNumber ? '***' + phoneNumber.slice(-4) : null,
      userData: userData ? 'Present' : 'Missing',
      token: token ? 'Present' : 'Missing'
    });
  }, [orderId, userId, phoneNumber, userData, token]);

  const handleGoToDashboard = () => {
    // Validate authentication data using utility function
    const validation = validateAuthData({ userId, phoneNumber, userData, token });
    
    if (!validation.isValid) {
      console.warn('Missing authentication data in PaymentSuccessScreen:', validation.missing);
      Alert.alert(
        'Authentication Error',
        `Missing required data: ${validation.missing.join(', ')}. Please login again.`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to login screen if authentication data is missing
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            }
          }
        ]
      );
      return;
    }

    // Navigate to Dashboard with all authentication data
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'Dashboard',
          params: { userId, phoneNumber, userData, token },
        },
      ],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Ionicons name="checkmark-circle" size={64} color="#22c55e" />
        </View>
        <Text style={styles.title}>Your payment is confirmed</Text>
        <Text style={styles.subtitle}>Thank you for your order. We have accepted your order and will deliver your product very soon.</Text>
        <Text style={styles.orderText}>Your order id is <Text style={styles.bold}>{orderId || '—'}</Text></Text>
      </View>

      <TouchableOpacity
        style={styles.primary}
        onPress={handleGoToDashboard}
      >
        <Text style={styles.primaryText}>Go to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, justifyContent: 'center' },
  card: { backgroundColor: '#f8fff9', padding: 24, borderRadius: 16, alignItems: 'center', marginBottom: 24 },
  iconWrap: { marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 8 },
  orderText: { fontSize: 14, color: '#374151' },
  bold: { fontWeight: '700' },
  primary: { backgroundColor: '#22c55e', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default PaymentSuccessScreen;
