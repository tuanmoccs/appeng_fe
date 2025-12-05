export interface LoginCredentials {
  email: string
  password: string
  remember?: boolean
  captcha_token?: string | null;
  otp_code?: string | null;
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
  refresh_token?: string
  expires_in?: number
}