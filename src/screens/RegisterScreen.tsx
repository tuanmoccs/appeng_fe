import React, { useState, useEffect } from 'react';
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
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../constants/colors';
import { register, clearError } from '../store/slices/authSlice';
import type { RootState, AppDispatch } from '../store/store';
import type { RegisterData } from '../services/authService';
import { validateEmail } from '../utils/validation';

const RegisterScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  useEffect(() => {
    // Nếu đã xác thực, chuyển hướng đến màn hình chính
    if (isAuthenticated) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    }
  }, [isAuthenticated, navigation]);

  useEffect(() => {
    // Hiển thị thông báo lỗi từ API
    if (error) {
      Alert.alert('Lỗi đăng ký', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
    };

    // Kiểm tra tên
    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên của bạn';
      isValid = false;
    }

    // Kiểm tra email
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
      isValid = false;
    } else if (!validateEmail(formData.email.trim())) {
      newErrors.email = 'Email không hợp lệ';
      isValid = false;
    }

    // Kiểm tra mật khẩu
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      isValid = false;
    }

    // Kiểm tra xác nhận mật khẩu
    if (!formData.password_confirmation) {
      newErrors.password_confirmation = 'Vui lòng xác nhận mật khẩu';
      isValid = false;
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Mật khẩu xác nhận không khớp';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = () => {
    // Đóng keyboard trước khi validate
    Keyboard.dismiss();
    
    // Luôn validate form khi bấm đăng ký
    if (validateForm()) {
      dispatch(register({
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim(),
      }));
    }
  };

  const handleLogin = () => {
    // Đóng keyboard và chuyển màn hình
    Keyboard.dismiss();
    navigation.navigate('Login');
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleInputChange = (field: keyof RegisterData, value: string) => {
    setFormData({ ...formData, [field]: value });
    
    // Xóa lỗi khi người dùng bắt đầu nhập
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
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
          <View style={styles.formContainer}>
            <Text style={styles.title}>Đăng ký tài khoản</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Họ tên</Text>
              <TextInput
                style={[styles.input, errors.name ? styles.inputError : null]}
                placeholder="Nhập họ tên của bạn"
                placeholderTextColor={COLORS.TEXT_SECONDARY}
                value={formData.name}
                onChangeText={(text) => handleInputChange('name', text)}
                returnKeyType="next"
                blurOnSubmit={false}
              />
              {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, errors.email ? styles.inputError : null]}
                placeholder="Nhập email của bạn"
                placeholderTextColor={COLORS.TEXT_SECONDARY}
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(text) => handleInputChange('email', text)}
                returnKeyType="next"
                blurOnSubmit={false}
              />
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mật khẩu</Text>
              <TextInput
                style={[styles.input, errors.password ? styles.inputError : null]}
                placeholder="Nhập mật khẩu của bạn"
                placeholderTextColor={COLORS.TEXT_SECONDARY}
                secureTextEntry
                value={formData.password}
                onChangeText={(text) => handleInputChange('password', text)}
                returnKeyType="next"
                blurOnSubmit={false}
              />
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Xác nhận mật khẩu</Text>
              <TextInput
                style={[styles.input, errors.password_confirmation ? styles.inputError : null]}
                placeholder="Nhập lại mật khẩu của bạn"
                placeholderTextColor={COLORS.TEXT_SECONDARY}
                secureTextEntry
                value={formData.password_confirmation}
                onChangeText={(text) => handleInputChange('password_confirmation', text)}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
              {errors.password_confirmation ? (
                <Text style={styles.errorText}>{errors.password_confirmation}</Text>
              ) : null}
            </View>

            <TouchableOpacity
              style={[styles.button, styles.registerButton]}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={COLORS.WHITE} />
              ) : (
                <Text style={styles.buttonText}>Đăng ký</Text>
              )}
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Đã có tài khoản? </Text>
              <TouchableOpacity onPress={handleLogin} activeOpacity={0.8}>
                <Text style={styles.loginLink}>Đăng nhập</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
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
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
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
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  registerButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  buttonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  loginText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
  },
  loginLink: {
    color: COLORS.PRIMARY,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RegisterScreen;