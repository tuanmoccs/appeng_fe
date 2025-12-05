"use client"

// src/screens/TwoFactorSettingsScreen.tsx

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  TextInput,
} from "react-native"
import { SvgXml } from "react-native-svg"
import { COLORS } from "../constants/colors"
import api from "../services/api"

const TwoFactorSettingsScreen = ({ navigation }: any) => {
  const [isEnabled, setIsEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [qrCode, setQrCode] = useState("")
  const [secret, setSecret] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
const [password, setPassword] = useState("")

  useEffect(() => {
    checkTwoFactorStatus()
  }, [])

  const checkTwoFactorStatus = async () => {
    try {
      const response = await api.get("/auth/user")
      console.log("[User data:", response.data)
      setIsEnabled(response.data.two_factor_enabled || response.data.user?.two_factor_enabled || false)
    } catch (error) {
      console.error("Check 2FA status error:", error)
    }
  }

  const handleEnable2FA = async () => {
    setIsLoading(true)
    try {
      const response = await api.post("/2fa/enable")

      if (response.data.success) {
        setQrCode(response.data.qr_code)
        setSecret(response.data.secret)
        setShowQRModal(true)
      }
    } catch (error: any) {
      Alert.alert("Lỗi", error.response?.data?.message || "Không thể bật 2FA")
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirm2FA = async () => {
    if (!otpCode || otpCode.length !== 6) {
      Alert.alert("Lỗi", "Vui lòng nhập mã OTP 6 số")
      return
    }

    setIsLoading(true)
    try {
      const response = await api.post("/2fa/confirm", { code: otpCode })

      if (response.data.success) {
        setRecoveryCodes(response.data.recovery_codes)
        setShowQRModal(false)
        setShowRecoveryCodes(true)
        setIsEnabled(true)
      }
    } catch (error: any) {
      Alert.alert("Lỗi", error.response?.data?.message || "Mã OTP không đúng")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisable2FA = () => {
    Alert.alert(
      "Tắt xác thực 2 bước", 
      "Bạn có chắc muốn tắt xác thực 2 bước không?", 
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Tắt",
          style: "destructive",
          onPress: () => {
            // Hiển thị modal nhập mật khẩu
            setShowPasswordModal(true)
          },
        },
      ]
    )
  }

const confirmDisable2FA = async () => {
  if (!password) {
    Alert.alert("Lỗi", "Vui lòng nhập mật khẩu")
    return
  }

  try {
    setIsLoading(true)
    await api.post("/2fa/disable", { password })
    setIsEnabled(false)
    setShowPasswordModal(false)
    setPassword("")
    Alert.alert("Thành công", "2FA đã được tắt")
  } catch (error: any) {
    Alert.alert("Lỗi", error.response?.data?.message || "Không thể tắt 2FA")
  } finally {
    setIsLoading(false)
  }
}

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Xác thực 2 bước (2FA)</Text>
        <Text style={styles.description}>
          Bảo vệ tài khoản của bạn với lớp bảo mật bổ sung thông qua Google Authenticator
        </Text>

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Trạng thái:</Text>
          <View style={[styles.statusBadge, isEnabled && styles.statusBadgeActive]}>
            <Text style={[styles.statusText, isEnabled && styles.statusTextActive]}>
              {isEnabled ? "✓ Đã bật" : "○ Chưa bật"}
            </Text>
          </View>
        </View>

        {!isEnabled ? (
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={handleEnable2FA}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.WHITE} />
            ) : (
              <Text style={styles.buttonText}>Bật xác thực 2 bước</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.buttonDanger]}
            onPress={handleDisable2FA}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Tắt xác thực 2 bước</Text>
          </TouchableOpacity>
        )}

        {/* QR Code Modal */}
        <Modal visible={showQRModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Quét mã QR</Text>
              <Text style={styles.modalDescription}>Sử dụng Google Authenticator để quét mã QR này</Text>

              {qrCode && (
                <View style={styles.qrContainer}>
                  <SvgXml xml={qrCode} width={200} height={200} />
                </View>
              )}

              <Text style={styles.secretLabel}>Hoặc nhập mã thủ công:</Text>
              <Text style={styles.secretText} selectable>
                {secret}
              </Text>

              <TextInput
                style={styles.otpInput}
                placeholder="Nhập mã 6 số"
                keyboardType="number-pad"
                maxLength={6}
                value={otpCode}
                onChangeText={setOtpCode}
              />

              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                onPress={handleConfirm2FA}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={COLORS.WHITE} />
                ) : (
                  <Text style={styles.buttonText}>Xác nhận</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowQRModal(false)}>
                <Text style={styles.cancelText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Recovery Codes Modal */}
        <Modal visible={showRecoveryCodes} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Mã khôi phục</Text>
              <Text style={styles.modalDescription}>
                Lưu các mã này ở nơi an toàn. Bạn có thể sử dụng chúng để đăng nhập khi không có Google Authenticator.
              </Text>

              <ScrollView style={styles.codesContainer}>
                {recoveryCodes.map((code, index) => (
                  <Text key={index} style={styles.codeText} selectable>
                    {code}
                  </Text>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                onPress={() => setShowRecoveryCodes(false)}
              >
                <Text style={styles.buttonText}>Đã lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal visible={showPasswordModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Xác nhận mật khẩu</Text>
            <Text style={styles.modalDescription}>
              Nhập mật khẩu để tắt xác thực 2 bước
            </Text>

            <TextInput
              style={styles.otpInput}
              placeholder="Nhập mật khẩu"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={confirmDisable2FA}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.WHITE} />
              ) : (
                <Text style={styles.buttonText}>Xác nhận</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => {
                setShowPasswordModal(false)
                setPassword("")
              }}
            >
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.PRIMARY,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 24,
    lineHeight: 20,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.WHITE,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
  },
  statusBadgeActive: {
    backgroundColor: "#d4edda",
  },
  statusText: {
    fontSize: 14,
    color: "#666",
  },
  statusTextActive: {
    color: "#155724",
    fontWeight: "600",
  },
  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonPrimary: {
    backgroundColor: COLORS.PRIMARY,
  },
  buttonDanger: {
    backgroundColor: "#dc3545",
  },
  buttonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 24,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 20,
  },
  qrContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  secretLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  secretText: {
    fontSize: 12,
    fontFamily: "monospace",
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    textAlign: "center",
    letterSpacing: 4,
    marginBottom: 16,
  },
  cancelButton: {
    marginTop: 12,
    padding: 12,
    alignItems: "center",
  },
  cancelText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
  },
  codesContainer: {
    maxHeight: 300,
    marginBottom: 20,
  },
  codeText: {
    fontSize: 14,
    fontFamily: "monospace",
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
})

export default TwoFactorSettingsScreen
