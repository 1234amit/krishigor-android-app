import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URLS } from '../config/api';
import { retryRequest } from '../utils/networkUtils';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const [token, setToken] = useState(null);

  // Function to set token (called from login screens)
  const setAuthToken = (authToken) => {
    setToken(authToken);
  };

  // Function to fetch cart count
  const fetchCartCount = async () => {
    if (!token) {
      setCartCount(0);
      return;
    }

    try {
      const response = await retryRequest(async () => {
        return axios.get(API_URLS.GET_CART, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      });

      let items = [];
      if (response.data.success) {
        items = response.data.data || response.data.cartItems || response.data.items || [];
      } else if (response.data.data) {
        items = response.data.data;
      } else if (Array.isArray(response.data)) {
        items = response.data;
      } else if (response.status === 200) {
        items = response.data.data || response.data.cartItems || response.data.items || [];
      }

      // Calculate total quantity from all cart items
      const totalQuantity = Array.isArray(items) 
        ? items.reduce((total, item) => total + (parseInt(item.quantity) || 0), 0)
        : 0;

      setCartCount(totalQuantity);
    } catch (error) {
      console.error('Error fetching cart count:', error);
      setCartCount(0);
    }
  };

  // Function to update cart count (called when adding/removing items)
  const updateCartCount = (newCount) => {
    setCartCount(newCount);
  };

  // Function to increment cart count (called when adding item)
  const incrementCartCount = (quantity = 1) => {
    setCartCount(prev => prev + quantity);
  };

  // Function to decrement cart count (called when removing item)
  const decrementCartCount = (quantity = 1) => {
    setCartCount(prev => Math.max(0, prev - quantity));
  };

  useEffect(() => {
    if (token) {
      fetchCartCount();
      
      // Set up periodic refresh for real-time updates
      const intervalId = setInterval(() => {
        fetchCartCount();
      }, 5000); // Refresh every 5 seconds
      
      return () => clearInterval(intervalId);
    }
  }, [token, fetchCartCount]);

  const value = {
    cartCount,
    fetchCartCount,
    updateCartCount,
    incrementCartCount,
    decrementCartCount,
    setAuthToken,
    token
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
