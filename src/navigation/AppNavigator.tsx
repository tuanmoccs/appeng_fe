import { useEffect, useState } from "react"
import { NavigationContainer, useNavigation } from "@react-navigation/native"
import { createStackNavigator, StackNavigationProp } from "@react-navigation/stack"
import { Text, ActivityIndicator, View, Modal, TouchableOpacity, Dimensions } from "react-native"
import { useDispatch, useSelector } from "react-redux"
import { COLORS } from "../constants/colors"
import { checkAuthStatus } from "../store/slices/authSlice"
import type { RootState, AppDispatch } from "../store/store"

// Import screens
import LoginScreen from "../screens/LoginScreen"
import RegisterScreen from "../screens/RegisterScreen"
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen"
import HomeScreen from "../screens/HomeScreen"
import LessonScreen from "../screens/LessonScreen"
import LessonDetailScreen from "../screens/LessonDetailScreen"
import QuizScreen from "../screens/QuizScreen"
import ProfileScreen from "../screens/ProfileScreen"
import WordListScreen from "../screens/WordListScreen"
import WordDetailScreen from "../screens/WordDetailScreen"
import QuizDetailScreen from "../screens/QuizDetailScreen"
import TestScreen from "../screens/TestScreen"
import TestDetailScreen from "../screens/TestDetailScreen"
import ListeningScreen from "../screens/ListeningScreen"
import ListeningDetailScreen from "../screens/ListeningDetailScreen"
import OTPVerification from "../screens/OTPverification"

const { width } = Dimensions.get('window')

// Define navigation types
type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  OTPVerification: undefined;
}

type MainStackParamList = {
  Home: undefined;
  Lessons: undefined;
  LessonDetail: { lessonId?: string };
  Words: undefined;
  WordDetail: { wordId?: string };
  Tests: undefined;
  TestDetail: { testId?: string };
  Listenings: undefined;
  ListeningDetail: { listeningId?: string };
  Quizzes: undefined;
  QuizDetail: { quizId?: string };
  Profile: undefined;
}

type MainStackNavigationProp = StackNavigationProp<MainStackParamList>

// Create navigation stacks
const AuthStack = createStackNavigator<AuthStackParamList>()
const MainStack = createStackNavigator<MainStackParamList>()

// Auth Stack Navigator
const AuthStackNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <AuthStack.Screen 
          name="OTPVerification" 
          component={OTPVerification}
          options={{ 
            title: 'Xác thực OTP',
            headerShown: true 
          }}
        />
    </AuthStack.Navigator>
  )
}

// Define types for MenuModal props
interface MenuModalProps {
  visible: boolean;
  onClose: () => void;
}

// Custom Menu Modal
const MenuModal = ({ visible, onClose }: MenuModalProps) => {
  const navigation = useNavigation<any>()
  
  const menuItems: Array<{
    name: string;
    title: string;
    screen: keyof MainStackParamList;
  }> = [
    { name: "Home", title: "🏠 Home", screen: "Home" },
    { name: "Lessons", title: "📚 Lessons", screen: "Lessons" },
    { name: "Words", title: "📝 Vocabulary", screen: "Words" },
    { name: "Tests", title: "📄 Tests", screen: "Tests" },
    { name: "Listenings", title: "🎧 Listening Tests", screen: "Listenings" },
    { name: "Quizzes", title: "✏️ Quizzes", screen: "Quizzes" },
    { name: "Profile", title: "👤 Profile", screen: "Profile" },
  ]

  const handleNavigate = (screen: keyof MainStackParamList) => {
    navigation.navigate(screen as any)
    onClose()
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={{ 
          flex: 1, 
          backgroundColor: 'rgba(0,0,0,0.5)' 
        }}
        onPress={onClose}
      >
        <View style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: width * 0.75,
          backgroundColor: COLORS.BACKGROUND,
          paddingTop: 60,
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 2, height: 0 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        }}>
          <View style={{ 
            padding: 20, 
            borderBottomWidth: 1, 
            borderBottomColor: COLORS.BORDER || '#e0e0e0',
            marginBottom: 10
          }}>
            <Text style={{ 
              fontSize: 20, 
              fontWeight: 'bold', 
              color: COLORS.TEXT_PRIMARY 
            }}>
              Menu
            </Text>
          </View>
          
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={{
                paddingVertical: 15,
                paddingHorizontal: 20,
                borderBottomWidth: 0.5,
                borderBottomColor: COLORS.BORDER || '#f0f0f0'
              }}
              onPress={() => handleNavigate(item.screen)}
            >
              <Text style={{ 
                fontSize: 16, 
                color: COLORS.TEXT_PRIMARY,
                fontWeight: '500'
              }}>
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  )
}

// Wrapper component để có thể sử dụng navigation trong MainStackNavigator
const MainStackScreen = () => {
  const [menuVisible, setMenuVisible] = useState(false)

  const HamburgerButton = () => (
    <TouchableOpacity
      style={{ 
        marginLeft: 15,
        padding: 5
      }}
      onPress={() => setMenuVisible(true)}
    >
      <Text style={{ 
        fontSize: 24, 
        color: COLORS.PRIMARY 
      }}>
        ☰
      </Text>
    </TouchableOpacity>
  )

  return (
    <>
      <MainStack.Navigator>
        <MainStack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{
            title: "Home",
            headerLeft: () => <HamburgerButton />,
          }} 
        />
        <MainStack.Screen 
          name="Lessons" 
          component={LessonScreen} 
          options={{
            title: "Lessons",
            headerLeft: () => <HamburgerButton />,
          }} 
        />
        <MainStack.Screen 
          name="LessonDetail" 
          component={LessonDetailScreen} 
          options={{ headerShown: false }} 
        />
        <MainStack.Screen 
          name="Words" 
          component={WordListScreen} 
          options={{
            title: "Vocabulary",
            headerLeft: () => <HamburgerButton />,
          }} 
        />
        <MainStack.Screen 
          name="WordDetail" 
          component={WordDetailScreen} 
          options={{ title: "Word Details" }} 
        />
        <MainStack.Screen 
          name="Tests" 
          component={TestScreen} 
          options={{
            title: "Tests",
            headerLeft: () => <HamburgerButton />,
          }} 
        />
        <MainStack.Screen 
          name="TestDetail" 
          component={TestDetailScreen} 
          options={{ title: "Test" }} 
        />
        <MainStack.Screen 
          name="Listenings" 
          component={ListeningScreen} 
          options={{
            title: "Listenings",
            headerLeft: () => <HamburgerButton />,
          }} 
        />
        <MainStack.Screen 
          name="ListeningDetail" 
          component={ListeningDetailScreen} 
          options={{ title: "Listening Detail" }} 
        />
        <MainStack.Screen 
          name="Quizzes" 
          component={QuizScreen} 
          options={{
            title: "Quizzes",
            headerLeft: () => <HamburgerButton />,
          }} 
        />
        <MainStack.Screen 
          name="QuizDetail" 
          component={QuizDetailScreen} 
          options={{ title: "Quiz" }} 
        />
        <MainStack.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={{
            title: "My Profile",
            headerLeft: () => <HamburgerButton />,
          }} 
        />
      </MainStack.Navigator>

      <MenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
      />
    </>
  )
}

// Main Stack Navigator với navigation
const MainStackNavigator = () => {
  return <MainStackScreen />
}

// Loading Screen Component
const LoadingScreen = () => {
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: "center", 
      alignItems: "center", 
      backgroundColor: COLORS.BACKGROUND 
    }}>
      <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      <Text style={{ 
        marginTop: 16, 
        color: COLORS.TEXT_PRIMARY 
      }}>
        Đang kiểm tra đăng nhập...
      </Text>
    </View>
  )
}

// Main app navigator
const AppNavigator = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated, isLoading, isInitialized } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    dispatch(checkAuthStatus())
  }, [dispatch])

  if (!isInitialized || isLoading) {
    return <LoadingScreen />
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainStackNavigator /> : <AuthStackNavigator />}
    </NavigationContainer>
  )
}

export default AppNavigator
