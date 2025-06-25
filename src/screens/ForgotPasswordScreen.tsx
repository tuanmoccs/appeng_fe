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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
    justifyContent: "center",
  },
  formContainer: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 24,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 24,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    backgroundColor: COLORS.WHITE,
  },
  inputError: {
    borderColor: COLORS.ERROR,
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  resetButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  loginButton: {
    backgroundColor: COLORS.PRIMARY,
    marginTop: 16,
  },
  backButton: {
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  buttonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: "600",
  },
  backButtonText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: "600",
  },
  successContainer: {
    alignItems: "center",
    paddingVertical: 16,
  },
  successText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 20,
  },
})

export default ForgotPasswordScreen
