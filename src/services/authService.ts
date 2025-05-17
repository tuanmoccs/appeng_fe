// src/services/authService.ts
import api from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LoginCredentials, RegisterData } from "../types/auth";

// Auth service to handle user authentication
export const login = async (credentials: LoginCredentials) => {
  try {
    const response = await api.post("/auth/login", credentials);

    // Save token to AsyncStorage
    await AsyncStorage.setItem("auth_token", response.data.token);

    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const register = async (userData: RegisterData) => {
  try {
    const response = await api.post("/auth/register", userData);

    // Save token to AsyncStorage
    await AsyncStorage.setItem("auth_token", response.data.token);

    return response.data;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    // Call logout endpoint if your API requires it
    await api.post("/auth/logout");

    // Remove token from AsyncStorage
    await AsyncStorage.removeItem("auth_token");
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

export const getAuthToken = async () => {
  return await AsyncStorage.getItem("auth_token");
};

export const isAuthenticated = async () => {
  const token = await getAuthToken();
  return !!token;
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get("/auth/user");
    return response.data;
  } catch (error) {
    console.error("Get user error:", error);
    throw error;
  }
};