import api from "./api"
import { ENDPOINTS } from "../constants/apiEndpoints"

export interface SendOTPRequest {
  email: string
}

export interface ResetPasswordOTPRequest {
  email: string
  otp: string
  password: string
  password_confirmation: string
}

export interface OTPResponse {
  success: boolean
  message: string
  cleared_lock?: boolean
  require_relogin?: boolean
}

export const sendResetOTP = async (email: string): Promise<OTPResponse> => {
  try {
    console.log("📧 Sending reset OTP to:", email)
    const response = await api.post(ENDPOINTS.SEND_RESET_OTP, { email })
    console.log("✅ OTP sent successfully:", response.data)
    return response.data
  } catch (error: any) {
    console.error("❌ Send OTP error:", error)

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    } else if (error.response?.data?.errors?.email) {
      throw new Error(error.response.data.errors.email[0])
    } else {
      throw new Error("Không thể gửi mã OTP. Vui lòng thử lại.")
    }
  }
}

export const resetPasswordWithOTP = async (data: ResetPasswordOTPRequest): Promise<OTPResponse> => {
  try {
    console.log("🔐 Resetting password with OTP for:", data.email)
    const response = await api.post(ENDPOINTS.RESET_PASSWORD_OTP, data)
    console.log("✅ Password reset successfully:", response.data)

    if (response.data.cleared_lock) {
      console.log("🔓 Account lock cleared after password reset")
    }

    return response.data
  } catch (error: any) {
    console.error("❌ Reset password with OTP error:", error)

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    } else if (error.response?.data?.errors) {
      const errors = error.response.data.errors
      const firstError = Object.values(errors)[0] as string[]
      throw new Error(firstError[0])
    } else {
      throw new Error("Không thể đặt lại mật khẩu. Vui lòng thử lại.")
    }
  }
}
