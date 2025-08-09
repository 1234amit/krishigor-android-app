import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PaymentSuccessScreen = ({ navigation, route }) => {
  const { orderId, userId, phoneNumber, userData, token } = route.params || {};

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
        onPress={() =>
          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'Dashboard',
                params: { userId, phoneNumber, userData, token },
              },
            ],
          })
        }
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
