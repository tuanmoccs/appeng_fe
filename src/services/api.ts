import axios from "axios"
import { API_BASE_URL } from "../constants/apiEndpoints"
import AsyncStorage from "@react-native-async-storage/async-storage"

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000,
})

/* ================= REQUEST INTERCEPTOR ================= */

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("auth_token")

      // console.log("🔍 API Request:", {
      //   url: config.url,
      //   method: config.method?.toUpperCase(),
      //   hasToken: !!token,
      //   tokenPreview: token ? `${token.substring(0, 15)}...` : null,
      // })

      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      return config
    } catch (error) {
      return config
    }
  },
  (error) => Promise.reject(error),
)

/* ================ RESPONSE INTERCEPTOR ================= */

let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

api.interceptors.response.use(
  (response) => {
    // console.log("✅ API Response:", {
    //   url: response.config.url,
    //   status: response.status,
    // })
    return response
  },

  async (error) => {
    const originalRequest = error.config

    // console.error("❌ API Response Error:", {
    //   url: originalRequest?.url,
    //   status: error.response?.status,
    //   message: error.response?.data?.message || error.message,
    // })

    // Nếu không phải 401 thì thôi
    if (error.response?.status !== 401) {
      return Promise.reject(error)
    }

    // Tránh vòng lặp vô hạn
    if (originalRequest._retry) {
      console.log("⛔ Refresh failed - logout")
      await AsyncStorage.multiRemove(["auth_token", "refresh_token"])
      return Promise.reject(error)
    }

    // Nếu đang refresh rồi → chờ
    if (isRefreshing) {
      return new Promise(function (resolve, reject) {
        failedQueue.push({ resolve, reject })
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
        .catch((err) => Promise.reject(err))
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      console.log("🔄 Refreshing token...")

      const refreshToken = await AsyncStorage.getItem("refresh_token")

      if (!refreshToken) {
        throw new Error("No refresh token")
      }

      // Gọi API refresh token
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refresh_token: refreshToken,
      })

      const newAccessToken = response.data.token
      const newRefreshToken = response.data.refresh_token
      
      console.log("new access token: ", newAccessToken)

      if (!newAccessToken || !newRefreshToken) {
        throw new Error("Invalid refresh response")
      }

      console.log("✅ Token refreshed")

      await AsyncStorage.setItem("auth_token", newAccessToken)
      await AsyncStorage.setItem("refresh_token", newRefreshToken)

      api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`

      processQueue(null, newAccessToken)

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

      return api(originalRequest)
    } catch (err) {
      console.log("Refresh token failed, logout")

      processQueue(err, null)

      await AsyncStorage.multiRemove(["auth_token", "refresh_token"])

      return Promise.reject(err)
    } finally {
      isRefreshing = false
    }
  },
)

export default api
