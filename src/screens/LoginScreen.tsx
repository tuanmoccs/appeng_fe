// src/screens/LoginScreen.tsx
// src/screens/LoginScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../constants/colors';
import { login, clearError } from '../store/slices/authSlice';
import type { RootState, AppDispatch } from '../store/store';
import type { LoginCredentials } from '../types/auth';
import { validateEmail } from '../utils/validation';
import { styles } from '../styles/LoginScreen.styles';

const LoginScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Thêm refs cho TextInput
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
    remember: true,
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    // Nếu đã xác thực, chuyển hướng đến màn hình chính
    if (isAuthenticated) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    }
  }, [isAuthenticated, navigation]);

  useEffect(() => {
    // Hiển thị thông báo lỗi từ API
    if (error) {
      Alert.alert('Lỗi đăng nhập', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: '', password: '' };

    // Kiểm tra email
    if (!credentials.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
      isValid = false;
    } else if (!validateEmail(credentials.email.trim())) {
      newErrors.email = 'Email không hợp lệ';
      isValid = false;
    }

    // Kiểm tra mật khẩu
    if (!credentials.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
      isValid = false;
    } else if (credentials.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = () => {
    // Ẩn bàn phím trước
    Keyboard.dismiss();
    
    // Sau đó mới validate và đăng nhập
    if (validateForm()) {
      dispatch(login({
        ...credentials,
        email: credentials.email.trim(),
      }));
    }
  };

  const handleRegister = () => {
    Keyboard.dismiss();
    navigation.navigate('Register');
  };

  const handleForgotPassword = () => {
    Keyboard.dismiss();
    navigation.navigate('ForgotPassword');
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials({ ...credentials, [field]: value });
    
    // Xóa lỗi khi người dùng bắt đầu nhập
    if (field === 'email' && errors.email) {
      setErrors({ ...errors, email: '' });
    }
    if (field === 'password' && errors.password) {
      setErrors({ ...errors, password: '' });
    }
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
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/th.jpg')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appName}>Learning English</Text>
            <Text style={styles.tagline}>Học Tiếng Anh mỗi ngày</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Đăng nhập</Text>

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
                onChangeText={(text) => handleInputChange('email', text)}
                onSubmitEditing={() => passwordInputRef.current?.focus()}
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
                onChangeText={(text) => handleInputChange('password', text)}
                onSubmitEditing={handleLogin}
              />
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={handleForgotPassword}
              activeOpacity={0.8}
            >
              <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.loginButton]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={COLORS.WHITE} />
              ) : (
                <Text style={styles.buttonText}>Đăng nhập</Text>
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
  );
};

export default LoginScreen;