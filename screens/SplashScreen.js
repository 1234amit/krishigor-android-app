import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      {/* Spacer Top */}
      <View style={{ flex: 1, marginTop:"60px" }} />

      {/* Logo */}
      <Image
        source={require('../assets/images/Logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Spacer Bottom */}
      <View style={{ flex: 2 }} />

      {/* Curved background */}
      <View style={styles.curve} />

      {/* Version Text */}
      <Text style={styles.version}>Version 1.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3FAF5',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
  },
  logo: {
    width: width * 0.35,
    height: width * 0.35,
    marginBottom: 12,
    marginTop: 100,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  krishi: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1CA15F',
    letterSpacing: 1,
  },
  ghar: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#F6C12C',
    letterSpacing: 1,
  },
  curve: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: width,
    height: height * 0.25,
    backgroundColor: '#fff',
    borderTopLeftRadius: width,
    borderTopRightRadius: width,
    zIndex: -1,
  },
  version: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    color: '#999',
    fontSize: 13,
  },
});
