
import axios from "axios"
import { API_BASE_URL } from "../constants/apiEndpoints"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000,
})

// Add request interceptor for auth token
api.interceptors.request.use(
  async (config) => {
    try {
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem("auth_token")

      console.log("🔍 API Request:", {
        url: config.url,
        method: config.method?.toUpperCase(),
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 20)}...` : null,
      })

      // If token exists, add to headers
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      return config
    } catch (error) {
      // console.error("❌ Error in request interceptor:", error)
      return config
    }
  },
  (error) => {
    // console.error("❌ Request interceptor error:", error)
    return Promise.reject(error)
  },
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", {
      url: response.config.url,
      status: response.status,
      hasData: !!response.data,
    })
    return response
  },
  async (error) => {
    console.error("❌ API Response Error:", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
    })

    // Handle 401 errors (unauthorized)
    if (error.response && error.response.status === 401) {
      console.log("🔐 Unauthorized, clearing token...")
      await AsyncStorage.removeItem("auth_token")
      delete api.defaults.headers.common["Authorization"]
    }

    return Promise.reject(error)
  },
)

export default api
