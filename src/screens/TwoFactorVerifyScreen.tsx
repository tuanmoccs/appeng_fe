"use client"

// src/screens/TwoFactorVerifyScreen.tsx

import type React from "react"
import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native"
import { useDispatch } from "react-redux"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { COLORS } from "../constants/colors"
import api from "../services/api"
import { ENDPOINTS } from "../constants/apiEndpoints"
import { set2FAVerified, clear2FARequirement } from "../store/slices/authSlice"
import type { AppDispatch } from "../store/store"

interface Props {
  route: any
  navigation: any
}

const TwoFactorVerifyScreen: React.FC<Props> = ({ route, navigation }) => {
  const { email, password } = route.params
  const [otpCode, setOtpCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [useRecoveryCode, setUseRecoveryCode] = useState(false)

  const dispatch = useDispatch<AppDispatch>()

  console.log("[v0] TwoFactorVerifyScreen params:", { email, password: password ? "***" : "MISSING" })

  const handleVerify = async () => {
    if (!otpCode.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập mã xác thực")
      return
    }

    if (!email || !password) {
      Alert.alert("Lỗi", "Thiếu thông tin đăng nhập. Vui lòng quay lại và thử lại.")
      console.log("[v0] Missing credentials:", { email, hasPassword: !!password })
      return
    }

    setIsLoading(true)

    const requestBody = {
      email,
      password,
      otp_code: otpCode.trim(),
    }
    console.log("[v0] 2FA request body:", {
      email: requestBody.email,
      hasPassword: !!requestBody.password,
      otp_code: requestBody.otp_code,
    })

    try {
      const response = await api.post(ENDPOINTS.LOGIN, requestBody)

      console.log("[v0] 2FA verify response:", response.data)

      if (response.data.success) {
        const { user, token, refresh_token } = response.data

        // ✅ LƯU CẢ 2 TOKENS
        console.log("[v0] Saving tokens:", {
          has_token: !!token,
          has_refresh_token: !!refresh_token,
          token_length: token?.length,
          refresh_token_length: refresh_token?.length,
        })

        await AsyncStorage.setItem("auth_token", token)
        await AsyncStorage.setItem("refresh_token", refresh_token)  // ← DÒNG QUAN TRỌNG!

        api.defaults.headers.common["Authorization"] = `Bearer ${token}`

        await dispatch(set2FAVerified({ user, token }))

        Alert.alert("Thành công", "Đăng nhập thành công!", [
          {
            text: "OK",
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: "Home" }],
              })
            },
          },
        ])
      }
    } catch (error: any) {
      console.log("[v0] 2FA verify error full:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      })
      Alert.alert("Lỗi xác thực", error.response?.data?.message || "Mã xác thực không đúng")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoBack = () => {
    dispatch(clear2FARequirement())
    navigation.goBack()
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Xác thực 2 bước</Text>
        <Text style={styles.description}>
          {useRecoveryCode ? "Nhập mã khôi phục (Recovery Code)" : "Nhập mã 6 số từ Google Authenticator"}
        </Text>

        <TextInput
          style={styles.input}
          placeholder={useRecoveryCode ? "xxxxx-xxxxx" : "123456"}
          placeholderTextColor={COLORS.TEXT_SECONDARY}
          value={otpCode}
          onChangeText={setOtpCode}
          keyboardType={useRecoveryCode ? "default" : "number-pad"}
          maxLength={useRecoveryCode ? 21 : 6}
          autoFocus
        />

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={isLoading}
        >
          {isLoading ? <ActivityIndicator color={COLORS.WHITE} /> : <Text style={styles.buttonText}>Xác thực</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => {
            setUseRecoveryCode(!useRecoveryCode)
            setOtpCode("")
          }}
        >
          <Text style={styles.switchText}>{useRecoveryCode ? "← Quay lại nhập mã OTP" : "Sử dụng mã khôi phục →"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Text style={styles.backText}>← Quay lại đăng nhập</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    justifyContent: "center",
    padding: 20,
  },
  content: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.PRIMARY,
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    textAlign: "center",
    letterSpacing: 4,
    marginBottom: 20,
  },
  button: {
    backgroundColor: COLORS.PRIMARY,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: "600",
  },
  switchButton: {
    marginTop: 16,
    padding: 12,
    alignItems: "center",
  },
  switchText: {
    color: COLORS.PRIMARY,
    fontSize: 14,
  },
  backButton: {
    marginTop: 8,
    padding: 12,
    alignItems: "center",
  },
  backText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
  },
})

export default TwoFactorVerifyScreen