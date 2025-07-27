import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SearchResultsScreen = ({ navigation, route }) => {
  const { searchQuery, allProducts, userId, phoneNumber, userData, token } = route.params;
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    if (!searchQuery) {
      navigation.goBack();
      return;
    }
    const searchTerm = searchQuery.toLowerCase().trim();
    const filtered = allProducts.filter(product => {
      const productName = product.productName?.toLowerCase() || '';
      const description = product.description?.toLowerCase() || '';
      const category = product.category?.toLowerCase() || '';
      return productName.includes(searchTerm) || description.includes(searchTerm) || category.includes(searchTerm);
    });
    setFilteredProducts(filtered);
  }, [searchQuery, allProducts]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search Results</Text>
      </View>
      {filteredProducts.length === 0 ? (
        <View style={styles.noResults}>
          <Ionicons name="alert-circle-outline" size={48} color="#ccc" />
          <Text>No products found for "{searchQuery}"</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.productCard}
              onPress={() => navigation.navigate('ProductDetails', {
                productId: item._id,
                userId,
                phoneNumber,
                userData,
                token
              })}
            >
              <View style={styles.productImageContainer}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.productImage} />
                ) : (
                  <Ionicons name="image" size={40} color="#ccc" />
                )}
              </View>
              <Text style={styles.productName}>{item.productName}</Text>
              <Text style={styles.productDescription}>{item.description}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  noResults: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 10,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  productDescription: {
    fontSize: 12,
    color: '#666',
    flex: 2,
  },
});

export default SearchResultsScreen; 