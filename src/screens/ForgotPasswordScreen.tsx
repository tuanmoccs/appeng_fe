"use client"

// src/screens/ForgotPasswordScreen.tsx
import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native"
import { COLORS } from "../constants/colors"
import { validateEmail } from "../utils/validation"
import { sendResetOTP } from "../services/otpService"
import { styles } from "../styles/ForgotPassword.styles"
const ForgotPasswordScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const validateForm = () => {
    if (!email.trim()) {
      setError("Vui lòng nhập email")
      return false
    } else if (!validateEmail(email.trim())) {
      setError("Email không hợp lệ")
      return false
    }
    setError("")
    return true
  }

  const handleResetPassword = async () => {
    // Đóng keyboard trước khi validate
    Keyboard.dismiss()

    if (!validateForm()) return

    setIsLoading(true)
    try {
      await sendResetOTP(email.trim())
      // Navigate to OTP verification screen
      navigation.navigate("OTPVerification", { email: email.trim() })
    } catch (error: any) {
      const message = error.message || "Đã xảy ra lỗi. Vui lòng thử lại sau."
      Alert.alert("Lỗi", message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToLogin = () => {
    Keyboard.dismiss()
    navigation.navigate("Login")
  }

  const dismissKeyboard = () => {
    Keyboard.dismiss()
  }

  const handleEmailChange = (text: string) => {
    setEmail(text)
    // Xóa lỗi khi người dùng bắt đầu nhập
    if (error) {
      setError("")
    }
  }

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
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
          <View style={styles.formContainer}>
            <Text style={styles.title}>Quên mật khẩu</Text>

            {isSuccess ? (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>
                  Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn. Vui lòng kiểm tra hộp thư.
                </Text>
                <TouchableOpacity
                  style={[styles.button, styles.loginButton]}
                  onPress={handleBackToLogin}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>Quay lại đăng nhập</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.description}>
                  Nhập email của bạn và chúng tôi sẽ gửi cho bạn mã OTP để đặt lại mật khẩu.
                </Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={[styles.input, error ? styles.inputError : null]}
                    placeholder="Nhập email của bạn"
                    placeholderTextColor={COLORS.TEXT_SECONDARY}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="done"
                    value={email}
                    onChangeText={handleEmailChange}
                    onSubmitEditing={handleResetPassword}
                  />
                  {error ? <Text style={styles.errorText}>{error}</Text> : null}
                </View>

                <TouchableOpacity
                  style={[styles.button, styles.resetButton]}
                  onPress={handleResetPassword}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color={COLORS.WHITE} />
                  ) : (
                    <Text style={styles.buttonText}>Gửi mã OTP</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.backButton]}
                  onPress={handleBackToLogin}
                  activeOpacity={0.8}
                >
                  <Text style={styles.backButtonText}>Quay lại đăng nhập</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  )
}

export default ForgotPasswordScreen
