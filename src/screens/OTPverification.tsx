import React, { useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import { COLORS } from '../constants/colors';
import { resetPasswordWithOTP, sendResetOTP } from '../services/otpService';
import { validateEmail } from '../utils/validation';
import { styles } from '../styles/OTPVerification.styles';

const OTPVerificationScreen = ({ navigation, route }: any) => {
  const { email } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Refs for OTP inputs
  const otpRefs = useRef<Array<TextInput | null>>([]); 

  useEffect(() => {
    // Start countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Validate OTP
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      newErrors.otp = 'Vui lòng nhập đầy đủ mã OTP 6 số';
    } else if (!/^\d{6}$/.test(otpString)) {
      newErrors.otp = 'Mã OTP chỉ được chứa số';
    }

    // Validate password
    if (!password.trim()) {
      newErrors.password = 'Vui lòng nhập mật khẩu mới';
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    // Validate confirm password
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOTPChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Clear OTP error when user starts typing
    if (errors.otp) {
      setErrors(prev => ({ ...prev, otp: '' }));
    }

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOTPKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleResetPassword = async () => {
    Keyboard.dismiss();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await resetPasswordWithOTP({
        email,
        otp: otp.join(''),
        password,
        password_confirmation: confirmPassword,
      });

      Alert.alert(
        'Thành công',
        'Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập với mật khẩu mới.',
        [
          {
            text: 'Đăng nhập',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Lỗi', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setIsResending(true);
    try {
      await sendResetOTP(email);
      setCanResend(false);
      setCountdown(60);
      Alert.alert('Thành công', 'Mã OTP mới đã được gửi đến email của bạn.');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message);
    } finally {
      setIsResending(false);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            <Text style={styles.title}>Xác thực OTP</Text>
            <Text style={styles.description}>
              Chúng tôi đã gửi mã OTP 6 số đến email: {email}
            </Text>

            {/* OTP Input */}
            <View style={styles.otpContainer}>
              <Text style={styles.label}>Mã OTP</Text>
              <View style={styles.otpInputContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(r) => {
                        otpRefs.current[index] = r;   // gán xong là hết, không return
                    }}
                    style={[
                        styles.otpInput,
                        errors.otp ? styles.inputError : null,
                    ]}
                    value={digit}
                    onChangeText={(value) => handleOTPChange(value, index)}
                    onKeyPress={({ nativeEvent }) => handleOTPKeyPress(nativeEvent.key, index)}
                    keyboardType="numeric"
                    maxLength={1}
                    textAlign="center"
                    />
                ))}
              </View>
              {errors.otp ? <Text style={styles.errorText}>{errors.otp}</Text> : null}
            </View>

            {/* Resend OTP */}
            <View style={styles.resendContainer}>
              {canResend ? (
                <TouchableOpacity onPress={handleResendOTP} disabled={isResending}>
                  <Text style={styles.resendText}>
                    {isResending ? 'Đang gửi...' : 'Gửi lại mã OTP'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.countdownText}>
                  Gửi lại sau {countdown}s
                </Text>
              )}
            </View>

            {/* New Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mật khẩu mới</Text>
              <TextInput
                style={[styles.input, errors.password ? styles.inputError : null]}
                placeholder="Nhập mật khẩu mới"
                placeholderTextColor={COLORS.TEXT_SECONDARY}
                secureTextEntry
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) {
                    setErrors(prev => ({ ...prev, password: '' }));
                  }
                }}
              />
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Xác nhận mật khẩu</Text>
              <TextInput
                style={[styles.input, errors.confirmPassword ? styles.inputError : null]}
                placeholder="Nhập lại mật khẩu mới"
                placeholderTextColor={COLORS.TEXT_SECONDARY}
                secureTextEntry
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword) {
                    setErrors(prev => ({ ...prev, confirmPassword: '' }));
                  }
                }}
                onSubmitEditing={handleResetPassword}
              />
              {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
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
                <Text style={styles.buttonText}>Đặt lại mật khẩu</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.backButton]}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Text style={styles.backButtonText}>Quay lại</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default OTPVerificationScreen;