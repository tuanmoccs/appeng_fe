
import api from "./api"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { ENDPOINTS } from "../constants/apiEndpoints"

export interface LoginCredentials {
  email: string
  password: string
  remember?: boolean
}

export interface RegisterData {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export interface AuthResponse {
  user: {
    id: number
    name: string
    email: string
    role: string
    created_at: string
    updated_at: string
  }
  token: string
}

// Initialize auth on app start
export const initializeAuth = async (): Promise<void> => {
  try {
    const token = await AsyncStorage.getItem("auth_token")
    if (token) {
      console.log("🔑 Setting auth token from storage")
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`
    }
  } catch (error) {
    console.error("❌ Failed to initialize auth:", error)
  }
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    console.log("🔑 Login attempt:", {
      endpoint: ENDPOINTS.LOGIN,
      credentials: {
        email: credentials.email,
        password: "***hidden***",
        remember: credentials.remember,
      },
    })

    const response = await api.post(ENDPOINTS.LOGIN, credentials)

    console.log("✅ Login response received:", {
      status: response.status,
      data: response.data,
    })

    // Backend trả về: { success: true, message: '...', user: {...}, token: '...' }
    const { user, token, success, message } = response.data

    if (!success) {
      console.error("❌ Login failed:", message)
      throw new Error(message || "Đăng nhập thất bại")
    }

    if (!token) {
      console.error("❌ No token received")
      throw new Error("Không nhận được token từ server")
    }

    if (!user) {
      console.error("❌ No user data received")
      throw new Error("Không nhận được thông tin người dùng")
    }

    console.log("💾 Saving token to AsyncStorage...")
    await AsyncStorage.setItem("auth_token", token)

    console.log("🔒 Setting Authorization header...")
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`

    // Verify token works
    try {
      console.log("🔍 Verifying token...")
      const userResponse = await api.get(ENDPOINTS.USER)
      console.log("✅ Token verification successful:", userResponse.data)
    } catch (verifyError: any) {
      console.error("❌ Token verification failed:", verifyError)

      if (verifyError.response) {
        console.error("Verification error details:", {
          status: verifyError.response.status,
          data: verifyError.response.data,
          headers: verifyError.response.headers,
        })
      }

      // Don't throw here, just log - allow login to continue
    }

    console.log("✅ Login successful!")
    return { user, token }
  } catch (error: any) {
    console.error("❌ Login error:", error)

    if (error.response) {
      console.error("Response error:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
      })
    } else if (error.request) {
      console.error("Request error (no response):", error.request)
    } else {
      console.error("Setup error:", error.message)
    }

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
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

    const { user, token, success } = response.data

    if (!success) {
      throw new Error(response.data.message || "Đăng ký thất bại")
    }

    if (token) {
      await AsyncStorage.setItem("auth_token", token)
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
      await api.post(ENDPOINTS.LOGOUT)
    }
  } catch (error) {
    console.error("Logout error:", error)
  } finally {
    // Always clean up local storage
    await AsyncStorage.removeItem("auth_token")
    delete api.defaults.headers.common["Authorization"]
  }
}

export const checkAuth = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem("auth_token")

    if (!token) {
      console.log("🔍 No token found in storage")
      return false
    }

    console.log("🔑 Found token, setting header...")
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`

    console.log("🔍 Checking auth status...")
    const response = await api.get(ENDPOINTS.USER)
    console.log("✅ Auth check successful")
    return !!response.data
  } catch (error: any) {
    console.error("❌ Check auth error:", error)

    if (error.response) {
      console.error("Auth check error details:", {
        status: error.response.status,
        data: error.response.data,
      })
    }

    console.log("🧹 Cleaning up invalid auth data...")
    await AsyncStorage.removeItem("auth_token")
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
