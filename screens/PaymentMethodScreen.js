import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URLS } from '../config/api';

const PaymentMethodScreen = ({ navigation, route }) => {
  const { orderId, token, onPaymentSuccess } = route.params || {};
  const [submitting, setSubmitting] = useState(false);
  const [method, setMethod] = useState('cash_on_delivery');

  const handleProceed = async () => {
    if (!orderId || !token) {
      Alert.alert('Error', 'Missing order information');
      return;
    }

    if (method !== 'cash_on_delivery') {
      Alert.alert('Info', 'Only Cash on Delivery is wired right now.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await axios.post(
        API_URLS.INITIATE_COD,
        { orderId, notes: 'COD from app' },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      if (res.data?.success) {
        // Notify parent (for cart clear, etc.)
        if (typeof onPaymentSuccess === 'function') {
          try { onPaymentSuccess(); } catch {}
        }
        navigation.replace('PaymentSuccess', {
          orderId,
          paymentId: res.data.data?.paymentId,
        });
      } else {
        Alert.alert('Payment', res.data?.message || 'Failed to initiate payment');
      }
    } catch (e) {
      Alert.alert('Payment', e?.response?.data?.message || e.message || 'Failed to initiate payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Method</Text>

      <TouchableOpacity
        style={[styles.method, method === 'cash_on_delivery' && styles.methodSelected]}
        onPress={() => setMethod('cash_on_delivery')}
      >
        <Ionicons
          name={method === 'cash_on_delivery' ? 'radio-button-on' : 'radio-button-off'}
          size={20}
          color={method === 'cash_on_delivery' ? '#4CAF50' : '#666'}
        />
        <Text style={styles.methodText}>Cash On Delivery</Text>
      </TouchableOpacity>

      {/* Other methods UI-only for now */}
      <TouchableOpacity style={styles.disabledMethod}>
        <Text style={styles.disabledText}>bKash (coming soon)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.proceed, submitting && styles.proceedDisabled]} disabled={submitting} onPress={handleProceed}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.proceedText}>Proceed to Order</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  method: { flexDirection: 'row', alignItems: 'center', padding: 14, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, marginBottom: 10 },
  methodSelected: { borderColor: '#4CAF50', backgroundColor: '#f0f8f0' },
  methodText: { marginLeft: 10, fontSize: 16, color: '#333' },
  disabledMethod: { padding: 14, borderWidth: 1, borderColor: '#eee', borderRadius: 10, marginVertical: 8, backgroundColor: '#fafafa' },
  disabledText: { color: '#aaa' },
  proceed: { marginTop: 'auto', backgroundColor: '#4CAF50', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  proceedDisabled: { backgroundColor: '#9cc89e' },
  proceedText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default PaymentMethodScreen;
