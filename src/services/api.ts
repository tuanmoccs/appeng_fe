// src/services/api.ts
import axios from "axios";
import { API_BASE_URL } from "../constants/apiEndpoints";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000, // Add timeout to prevent hanging requests
});

// Add request interceptor for auth token
api.interceptors.request.use(
  async (config) => {
    // Get token from AsyncStorage (not localStorage which is web-only)
    const token = await AsyncStorage.getItem("auth_token");

    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Handle 401 errors (unauthorized)
    if (error.response && error.response.status === 401) {
      // Clear AsyncStorage and redirect to login
      await AsyncStorage.removeItem("auth_token");
      // You might want to add navigation logic here
    }

    return Promise.reject(error);
  }
);

export default api;