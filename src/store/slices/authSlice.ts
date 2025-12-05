// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import * as authService from "../../services/authService"
import type { LoginCredentials, RegisterData, AuthResponse } from "../../types/auth"

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
  isLocked: boolean
  lockUntil: string | null
  attempts: number
  require2FA: boolean
  pending2FAData: {
    email: string
    password: string
  } | null
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
  isLocked: false,
  lockUntil: null,
  attempts: 0,
  require2FA: false,
  pending2FAData: null,
}

// Async thunks
export const login = createAsyncThunk("auth/login", async (credentials: LoginCredentials, { rejectWithValue }) => {
  try {
    const response = await authService.login(credentials)
    return response
  } catch (error: any) {
    console.log("[v0] authSlice login error:", {
      message: error.message,
      require_2fa: error.require_2fa,
      locked: error.locked,
    })

    return rejectWithValue({
      message: error.message || "Đăng nhập thất bại",
      locked: error.locked || false,
      lock_until: error.lock_until || null,
      attempts: error.attempts || 0,
      require_2fa: error.require_2fa || false,
    })
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
    console.error("Logout error:", error)
  }
})

export const checkAuthStatus = createAsyncThunk("auth/checkAuthStatus", async (_, { rejectWithValue }) => {
  try {
    console.log("🔍 Checking auth status...")
    const isAuthenticated = await authService.checkAuth()
    if (isAuthenticated) {
      const user = await authService.getCurrentUser()
      return { user, isAuthenticated: true }
    }
    return { user: null, isAuthenticated: false }
  } catch (error: any) {
    return { user: null, isAuthenticated: false }
  }
})

export const set2FAVerified = createAsyncThunk(
  "auth/set2FAVerified",
  async (data: { user: User; token: string }, { rejectWithValue }) => {
    try {
      return data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
      if (state.lockUntil) {
        const now = new Date().getTime()
        const lockTime = new Date(state.lockUntil).getTime()
        if (now >= lockTime) {
          state.isLocked = false
          state.lockUntil = null
          state.attempts = 0
        }
      }
    },
    resetAuth: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
      state.isLocked = false
      state.lockUntil = null
      state.attempts = 0
      state.require2FA = false
      state.pending2FAData = null
    },
    clear2FARequirement: (state) => {
      state.require2FA = false
      state.pending2FAData = null
    },
    setPending2FAData: (state, action: PayloadAction<{ email: string; password: string }>) => {
      state.pending2FAData = action.payload
      // Không set require2FA ở đây, sẽ được set trong login.rejected
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
        state.isLocked = false
        state.lockUntil = null
        state.attempts = 0
        state.require2FA = false
        state.pending2FAData = null
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false

        const payload = action.payload as any
        state.isLocked = payload?.locked || false
        state.lockUntil = payload?.lock_until || null
        state.attempts = payload?.attempts || 0

        if (payload?.require_2fa) {
          state.require2FA = true
          state.error = null
          console.log("[v0] authSlice: require_2fa detected, keeping pending2FAData:", state.pending2FAData)
        } else {
          state.error = payload?.message || "Đăng nhập thất bại"
          state.require2FA = false
          state.pending2FAData = null // Clear nếu không phải 2FA
        }
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

      // Set 2FA Verified
      .addCase(set2FAVerified.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
        state.isLocked = false
        state.lockUntil = null
        state.attempts = 0
        state.require2FA = false
        state.pending2FAData = null
      })
  },
})

export const { clearError, resetAuth, clear2FARequirement, setPending2FAData } = authSlice.actions
export default authSlice.reducer
