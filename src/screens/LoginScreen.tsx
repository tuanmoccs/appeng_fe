"use client"

// src/screens/LoginScreen.tsx
import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native"
import { useDispatch, useSelector } from "react-redux"
// import { WebView } from "react-native-webview"
import { COLORS } from "../constants/colors"
import { login, clearError, setPending2FAData, clear2FARequirement } from "../store/slices/authSlice"
import type { RootState, AppDispatch } from "../store/store"
import type { LoginCredentials } from "../types/auth"
import { validateEmail } from "../utils/validation"
import { styles } from "../styles/LoginScreen.styles"

// const RECAPTCHA_SITE_KEY = "6Ldc5xYsAAAAALg1ux7dB8aY3nCkGxzIX2GVyEVI"

const LoginScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>()
  const { isLoading, error, isAuthenticated, isLocked, lockUntil, attempts, require2FA, pending2FAData } = useSelector(
    (state: RootState) => state.auth,
  )

  const emailInputRef = useRef<TextInput>(null)
  const passwordInputRef = useRef<TextInput>(null)
  // const recaptchaRef = useRef<WebView>(null)

  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
    remember: true,
  })
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  })

  // const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  // const [showCaptcha, setShowCaptcha] = useState(false)

  const [lockTimeRemaining, setLockTimeRemaining] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      })
    }
  }, [isAuthenticated, navigation])

  useEffect(() => {
    console.log("[v0] LoginScreen useEffect 2FA check:", {
      require2FA,
      pendingEmail: pending2FAData?.email,
      hasPendingPassword: !!pending2FAData?.password,
    })

    if (require2FA && pending2FAData?.email && pending2FAData?.password) {
      console.log("[v0] Navigating to TwoFactorVerify with pending data...")

      navigation.navigate("TwoFactorVerifyScreen", {
        email: pending2FAData.email,
        password: pending2FAData.password,
      })
    }
  }, [require2FA, pending2FAData, navigation])

  useEffect(() => {
    if (isLocked && lockUntil) {
      const updateRemainingTime = () => {
        const now = new Date().getTime()
        const lockTime = new Date(lockUntil).getTime()
        const remaining = lockTime - now

        if (remaining <= 0) {
          setLockTimeRemaining(null)
          dispatch(clearError())
        } else {
          const minutes = Math.floor(remaining / 60000)
          const seconds = Math.floor((remaining % 60000) / 1000)
          setLockTimeRemaining(`${minutes}:${seconds.toString().padStart(2, "0")}`)
        }
      }

      updateRemainingTime()
      const interval = setInterval(updateRemainingTime, 1000)

      return () => clearInterval(interval)
    }
  }, [isLocked, lockUntil, dispatch])

  useEffect(() => {
    if (error) {
      if (isLocked) {
        Alert.alert(
          "Tài khoản bị khóa",
          `Tài khoản của bạn đã bị khóa tạm thời do đăng nhập sai quá 5 lần. Vui lòng thử lại sau ${lockTimeRemaining || "15 phút"}.`,
          [{ text: "OK", onPress: () => dispatch(clearError()) }],
        )
      } else {
        const remainingAttempts = 5 - attempts
        const message = remainingAttempts > 0 ? `${error} (Có ${remainingAttempts} lần thử)` : error
        Alert.alert("Lỗi đăng nhập", message, [{ text: "OK", onPress: () => dispatch(clearError()) }])
      }
    }
  }, [error, isLocked, dispatch, attempts, lockTimeRemaining])

  const validateForm = () => {
    let isValid = true
    const newErrors = { email: "", password: "" }

    if (!credentials.email.trim()) {
      newErrors.email = "Vui lòng nhập email"
      isValid = false
    } else if (!validateEmail(credentials.email.trim())) {
      newErrors.email = "Email không hợp lệ"
      isValid = false
    }

    if (!credentials.password) {
      newErrors.password = "Vui lòng nhập mật khẩu"
      isValid = false
    } else if (credentials.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleLogin = async () => {
    Keyboard.dismiss()

    if (isLocked) {
      Alert.alert("Tài khoản bị khóa", `Vui lòng thử lại sau ${lockTimeRemaining || "15 phút"}.`)
      return
    }

    if (!validateForm()) {
      return
    }

    try {
      console.log("[v0] Dispatching login...")

      dispatch(
        setPending2FAData({
          email: credentials.email.trim(),
          password: credentials.password,
        }),
      )

      await dispatch(
        login({
          ...credentials,
          email: credentials.email.trim(),
        }),
      ).unwrap()

      console.log("[v0] Login dispatch completed successfully")
    } catch (error: any) {
      console.log("[v0] Login error caught in handleLogin:", {
        message: error?.message,
        require_2fa: error?.require_2fa,
        locked: error?.locked,
      })

      if (!error?.require_2fa) {
        dispatch(clear2FARequirement())
      }
    }
  }

  const handleRegister = () => {
    Keyboard.dismiss()
    navigation.navigate("Register")
  }

  const handleForgotPassword = () => {
    Keyboard.dismiss()
    navigation.navigate("ForgotPassword")
  }

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials({ ...credentials, [field]: value })

    if (field === "email" && errors.email) {
      setErrors({ ...errors, email: "" })
    }
    if (field === "password" && errors.password) {
      setErrors({ ...errors, password: "" })
    }
  }

  // const recaptchaHTML = `...`

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Image source={require("../assets/images/th.jpg")} style={styles.logo} resizeMode="contain" />
            <Text style={styles.appName}>Learning English</Text>
            <Text style={styles.tagline}>Học Tiếng Anh mỗi ngày</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Đăng nhập</Text>

            {isLocked && (
              <View style={styles.warningContainer}>
                <Text style={styles.warningText}>
                  ⚠️ Tài khoản bị khóa tạm thời. Thử lại sau: {lockTimeRemaining || "15:00"}
                </Text>
              </View>
            )}

            {attempts > 0 && attempts < 5 && !isLocked && (
              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                  ⚠️ Đã sai {attempts} lần. Còn {5 - attempts} lần thử trước khi bị khóa.
                </Text>
              </View>
            )}

            {/* Comment phần cảnh báo CAPTCHA
            {requireCaptcha && !isLocked && (
              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>🔒 Yêu cầu xác minh CAPTCHA (Đã sai {attempts} lần)</Text>
              </View>
            )}
            */}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                ref={emailInputRef}
                style={[styles.input, errors.email ? styles.inputError : null]}
                placeholder="Nhập email của bạn"
                placeholderTextColor={COLORS.TEXT_SECONDARY}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                blurOnSubmit={false}
                value={credentials.email}
                onChangeText={(text) => handleInputChange("email", text)}
                onSubmitEditing={() => passwordInputRef.current?.focus()}
                editable={!isLocked && !isLoading}
              />
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mật khẩu</Text>
              <TextInput
                ref={passwordInputRef}
                style={[styles.input, errors.password ? styles.inputError : null]}
                placeholder="Nhập mật khẩu của bạn"
                placeholderTextColor={COLORS.TEXT_SECONDARY}
                secureTextEntry
                returnKeyType="done"
                value={credentials.password}
                onChangeText={(text) => handleInputChange("password", text)}
                onSubmitEditing={handleLogin}
                editable={!isLocked && !isLoading}
              />
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            {/* Comment toàn bộ phần CAPTCHA UI
            {showCaptcha && (
              <View style={styles.captchaContainer}>
                <WebView
                  ref={recaptchaRef}
                  source={{ html: recaptchaHTML }}
                  onMessage={onCaptchaMessage}
                  style={styles.captchaWebView}
                  javaScriptEnabled={true}
                />
                <TouchableOpacity style={styles.closeCaptchaButton} onPress={() => setShowCaptcha(false)}>
                  <Text style={styles.closeCaptchaText}>✕ Đóng</Text>
                </TouchableOpacity>
              </View>
            )}

            {requireCaptcha && !captchaToken && !showCaptcha && !isLocked && (
              <TouchableOpacity style={styles.captchaButton} onPress={() => setShowCaptcha(true)} activeOpacity={0.8}>
                <Text style={styles.captchaButtonText}>🤖 Xác minh CAPTCHA</Text>
              </TouchableOpacity>
            )}

            {captchaToken && (
              <View style={styles.captchaVerifiedContainer}>
                <Text style={styles.captchaVerifiedText}>✓ CAPTCHA đã được xác minh</Text>
              </View>
            )}
            */}

            <TouchableOpacity style={styles.forgotPasswordContainer} onPress={handleForgotPassword} activeOpacity={0.8}>
              <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.loginButton, (isLocked || isLoading) && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading || isLocked}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={COLORS.WHITE} />
              ) : (
                <Text style={styles.buttonText}>{isLocked ? "Tài khoản bị khóa" : "Đăng nhập"}</Text>
              )}
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Chưa có tài khoản? </Text>
              <TouchableOpacity onPress={handleRegister} activeOpacity={0.8}>
                <Text style={styles.registerLink}>Đăng ký ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  )
}

export default LoginScreen
