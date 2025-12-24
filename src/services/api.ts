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
  (response) => response,

  async (error) => {
    const originalRequest = error.config

    if (originalRequest.url?.includes("/refresh-token")) {
      console.log("⛔ Refresh token endpoint failed - clearing auth and stopping queue")
      await AsyncStorage.multiRemove(["auth_token", "refresh_token"])
      delete api.defaults.headers.common.Authorization
      isRefreshing = false
      processQueue(error, null)
      return Promise.reject(error)
    }

    if (error.response?.status !== 401) {
      return Promise.reject(error)
    }

    if (error.response?.data?.require_login) {
      console.log("⛔ Backend requires login - clearing auth")
      await AsyncStorage.multiRemove(["auth_token", "refresh_token"])
      delete api.defaults.headers.common.Authorization
      isRefreshing = false
      processQueue(error, null)
      return Promise.reject(error)
    }

    if (originalRequest._retry) {
      console.log("⛔ Refresh already tried - logout")
      await AsyncStorage.multiRemove(["auth_token", "refresh_token"])
      delete api.defaults.headers.common.Authorization
      isRefreshing = false
      processQueue(error, null)
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
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
      console.log("[v0] Attempting to refresh token...")

      const refreshToken = await AsyncStorage.getItem("refresh_token")

      if (!refreshToken) {
        throw new Error("No refresh token available")
      }

      const response = await axios.post(
        `${API_BASE_URL}/auth/refresh-token`,
        { refresh_token: refreshToken },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 10000,
        },
      )

      const { token, refresh_token, success } = response.data

      if (!success || !token || !refresh_token) {
        throw new Error("Invalid refresh response from server")
      }

      console.log("[v0] Token refreshed successfully, updating storage")

      await AsyncStorage.setItem("auth_token", token)
      await AsyncStorage.setItem("refresh_token", refresh_token)

      api.defaults.headers.common.Authorization = `Bearer ${token}`

      processQueue(null, token)

      originalRequest.headers.Authorization = `Bearer ${token}`
      return api(originalRequest)
    } catch (err: any) {
      console.log("[v0] Refresh token failed:", err.message)
      if (err.response?.data) {
        console.log("[v0] Error response:", err.response.data)
      }

      processQueue(err, null)

      await AsyncStorage.multiRemove(["auth_token", "refresh_token"])
      delete api.defaults.headers.common.Authorization

      return Promise.reject(err)
    } finally {
      isRefreshing = false
    }
  },
)

export default api
