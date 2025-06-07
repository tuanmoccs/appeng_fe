// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import * as authService from "../../services/authService"
import type { LoginCredentials, RegisterData, AuthResponse } from "../../services/authService"

interface User {
  id: number
  name: string
  email: string
  role: string
  created_at: string
  updated_at: string
  avatar?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
}

// Async thunks
export const login = createAsyncThunk("auth/login", async (credentials: LoginCredentials, { rejectWithValue }) => {
  try {
    const response = await authService.login(credentials)
    return response
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Đăng nhập thất bại"
    return rejectWithValue(message)
  }
})

export const register = createAsyncThunk("auth/register", async (data: RegisterData, { rejectWithValue }) => {
  try {
    const response = await authService.register(data)
    return response
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Đăng ký thất bại"
    return rejectWithValue(message)
  }
})

export const logout = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    await authService.logout()
  } catch (error: any) {
    // Even if logout request fails, we should still clear local auth state
    console.error("Logout error:", error)
  }
})

export const checkAuthStatus = createAsyncThunk("auth/checkAuthStatus", async (_, { rejectWithValue }) => {
  try {
    console.log("🔍 Checking auth status...")
    const isAuthenticated = await authService.checkAuth()
    if (isAuthenticated) {
      const user = await authService.getCurrentUser()
      //console.log("✅ User authenticated:", user)
      return { user, isAuthenticated: true }
    }
    //console.log("❌ User not authenticated")
    return { user: null, isAuthenticated: false }
  } catch (error: any) {
    //console.error("❌ Auth status check failed:", error)
    return { user: null, isAuthenticated: false }
  }
})

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    resetAuth: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.isAuthenticated = false
      })

      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.isAuthenticated = false
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.error = null
      })

      // Check Auth Status
      .addCase(checkAuthStatus.pending, (state) => {
        state.isLoading = true
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isLoading = false
        state.isInitialized = true
        state.isAuthenticated = action.payload.isAuthenticated
        state.user = action.payload.user
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.isLoading = false
        state.isInitialized = true
        state.isAuthenticated = false
        state.user = null
      })
  },
})

export const { clearError, resetAuth } = authSlice.actions
export default authSlice.reducer
