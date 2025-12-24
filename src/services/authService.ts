import api from "./api"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { ENDPOINTS } from "../constants/apiEndpoints"
import type { LoginCredentials, AuthResponse, RegisterData } from "../types/auth"
import axios from "axios"
import { API_BASE_URL } from "../constants/apiEndpoints"

const isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb)
}

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

// Initialize auth on app start
export const initializeAuth = async (): Promise<void> => {
  try {
    const token = await AsyncStorage.getItem("auth_token")
    if (token) {
      console.log("Setting auth token from storage")
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`
    }
  } catch (error) {
    console.error("Failed to initialize auth:", error)
  }
}

export const refreshToken = async (): Promise<string | null> => {
  const maxRetries = 3
  let lastError: any

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const refreshTokenValue = await AsyncStorage.getItem("refresh_token")

      if (!refreshTokenValue) {
        console.log("[v0] No refresh token found")
        return null
      }

      console.log(`[v0] Refresh attempt ${attempt + 1}/${maxRetries}`)

      const response = await axios.post(
        `${API_BASE_URL}/auth/refresh-token`,
        { refresh_token: refreshTokenValue },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 10000,
        },
      )

      const { token, refresh_token, success, expires_in } = response.data

      if (!success || !token || !refresh_token) {
        throw new Error("Invalid refresh response")
      }

      console.log("[v0] Token refreshed successfully!")
      console.log("[v0] Token expires in:", expires_in, "seconds")

      // Save new tokens
      await AsyncStorage.setItem("auth_token", token)
      await AsyncStorage.setItem("refresh_token", refresh_token)

      // Update API header
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`

      return token
    } catch (error: any) {
      lastError = error
      console.error(`[v0] Refresh attempt ${attempt + 1} failed:`, error.message)

      if (error.response?.data?.require_login) {
        console.log("[v0] Server requires login, stopping retry")
        break
      }

      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000
        console.log(`[v0] Waiting ${delay}ms before retry...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  console.error("[v0] All refresh attempts failed, clearing auth")
  await AsyncStorage.removeItem("auth_token")
  await AsyncStorage.removeItem("refresh_token")
  delete api.defaults.headers.common["Authorization"]

  return null
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    console.log("[v0] Login attempt:", {
      endpoint: ENDPOINTS.LOGIN,
      email: credentials.email,
      has_otp: !!credentials.otp_code,
    })

    const response = await api.post(ENDPOINTS.LOGIN, credentials)

    const { user, token, refresh_token, success, message, locked, lock_until, attempts, require_2fa, expires_in } =
      response.data

    if (require_2fa) {
      const error: any = new Error(message || "Vui lòng nhập mã xác thực 2FA")
      error.require_2fa = true
      error.locked = false
      error.lock_until = null
      error.attempts = 0
      throw error
    }

    if (!success) {
      const error: any = new Error(message || "Đăng nhập thất bại")
      error.locked = locked
      error.lock_until = lock_until
      error.attempts = attempts
      throw error
    }

    if (!token) {
      throw new Error("Không nhận được token từ server")
    }

    if (!refresh_token) {
      throw new Error("Không nhận được refresh token từ server")
    }

    if (!user) {
      throw new Error("Không nhận được thông tin người dùng")
    }

    console.log("[v0] Saving tokens to AsyncStorage...")
    console.log("[v0] Access token length:", token.length)
    console.log("[v0] Refresh token length:", refresh_token.length)
    console.log("[v0] Token expires in:", expires_in, "seconds")

    await AsyncStorage.setItem("auth_token", token)
    await AsyncStorage.setItem("refresh_token", refresh_token)

    console.log("[v0] Setting Authorization header...")
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`

    try {
      const userResponse = await api.get(ENDPOINTS.USER)
      console.log("[v0] Token verification successful")
    } catch (verifyError: any) {
      console.error("[v0] Token verification failed:", verifyError)
    }

    console.log("[v0] Login successful!")
    return { user, token }
  } catch (error: any) {
    if (error.require_2fa) {
      throw error
    }

    if (error.response?.data) {
      const errorData = error.response.data

      if (errorData.require_2fa) {
        const customError: any = new Error(errorData.message || "Vui lòng nhập mã xác thực 2FA")
        customError.require_2fa = true
        customError.locked = false
        customError.lock_until = null
        customError.attempts = 0
        throw customError
      }

      const customError: any = new Error(errorData.message || "Đăng nhập thất bại")
      customError.locked = errorData.locked || false
      customError.lock_until = errorData.lock_until || null
      customError.attempts = errorData.attempts || 0
      customError.require_2fa = false
      throw customError
    }

    if (error.code === "NETWORK_ERROR" || error.message.includes("Network Error")) {
      throw new Error("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.")
    }

    if (error.code === "ECONNABORTED") {
      throw new Error("Kết nối bị timeout. Vui lòng thử lại.")
    }

    throw new Error("Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.")
  }
}

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await api.post(ENDPOINTS.REGISTER, data)

    const { user, token, refresh_token, success } = response.data

    if (!success) {
      throw new Error(response.data.message || "Đăng ký thất bại")
    }

    if (token && refresh_token) {
      await AsyncStorage.setItem("auth_token", token)
      await AsyncStorage.setItem("refresh_token", refresh_token)
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`
    }

    return { user, token }
  } catch (error: any) {
    console.error("Register error:", error)

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }

    throw error
  }
}

export const logout = async (): Promise<void> => {
  try {
    const token = await AsyncStorage.getItem("auth_token")
    if (token) {
      console.log("[v0] Sending logout request to server...")
      await api.post(ENDPOINTS.LOGOUT)
      console.log("[v0] Server logout successful")
    }
  } catch (error) {
    console.error("[v0] Logout error:", error)
  } finally {
    console.log("[v0] Cleaning up local tokens...")
    await AsyncStorage.removeItem("auth_token")
    await AsyncStorage.removeItem("refresh_token")
    delete api.defaults.headers.common["Authorization"]
    console.log("[v0] Local cleanup completed")
  }
}

export const checkAuth = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem("auth_token")

    if (!token) {
      console.log("No token found in storage")
      return false
    }

    console.log("Found token, setting header...")
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`

    console.log("Checking auth status...")
    const response = await api.get(ENDPOINTS.USER)
    console.log("Auth check successful")
    return !!response.data
  } catch (error: any) {
    // Nếu lỗi 401, interceptor sẽ tự động thử refresh token
    if (error.response?.status === 401) {
      console.log("Token expired, interceptor will handle refresh")
      return false
    }

    console.log("Cleaning up invalid auth data...")
    await AsyncStorage.removeItem("auth_token")
    await AsyncStorage.removeItem("refresh_token")
    delete api.defaults.headers.common["Authorization"]
    return false
  }
}

export const getCurrentUser = async () => {
  try {
    const response = await api.get(ENDPOINTS.USER)
    return response.data
  } catch (error) {
    console.error("Get current user error:", error)
    throw error
  }
}
