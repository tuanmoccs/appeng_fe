"use client"

import { useEffect } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createStackNavigator } from "@react-navigation/stack"
import { Text, ActivityIndicator, View } from "react-native"
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
import QuizScreen from "../screens/QuizScreen"
import ProfileScreen from "../screens/ProfileScreen"
import WordListScreen from "../screens/WordListScreen"
import WordDetailScreen from "../screens/WordDetailScreen"
import QuizDetailScreen from "../screens/QuizDetailScreen"

// Create navigation stacks/tabs
const AuthStack = createStackNavigator()
const Tab = createBottomTabNavigator()
const HomeStack = createStackNavigator()
const LessonStack = createStackNavigator()
const QuizStack = createStackNavigator()
const ProfileStack = createStackNavigator()
const WordStack = createStackNavigator()

// Auth Stack Navigator (Login, Register, ForgotPassword)
const AuthStackNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  )
}

// Home stack navigator
const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Home" component={HomeScreen} options={{ title: "Dashboard" }} />
    </HomeStack.Navigator>
  )
}

// Lesson stack navigator
const LessonStackNavigator = () => {
  return (
    <LessonStack.Navigator>
      <LessonStack.Screen name="Lessons" component={LessonScreen} options={{ title: "Lessons" }} />
      {/* <LessonStack.Screen name="LessonDetail" component={LessonDetailScreen} options={{ headerShown: false }} /> */}
    </LessonStack.Navigator>
  )
}

// Quiz stack navigator
const QuizStackNavigator = () => {
  return (
    <QuizStack.Navigator>
      <QuizStack.Screen name="Quizzes" component={QuizScreen} options={{ title: "Quizzes" }} />
      <QuizStack.Screen name="QuizDetail" component={QuizDetailScreen} options={{ title: "Quiz" }} />
    </QuizStack.Navigator>
  )
}

// Profile stack navigator
const ProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} options={{ title: "My Profile" }} />
    </ProfileStack.Navigator>
  )
}

// Word stack navigator
const WordStackNavigator = () => {
  return (
    <WordStack.Navigator>
      <WordStack.Screen name="Words" component={WordListScreen} options={{ title: "Vocabulary" }} />
      <WordStack.Screen name="WordDetail" component={WordDetailScreen} options={{ title: "Word Details" }} />
    </WordStack.Navigator>
  )
}

// Main Tab Navigator (Protected Routes)
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconText

          if (route.name === "HomeTab") {
            iconText = "🏠"
          } else if (route.name === "LessonsTab") {
            iconText = "📚"
          } else if (route.name === "WordsTab") {
            iconText = "📝"
          } else if (route.name === "QuizzesTab") {
            iconText = "✏️"
          } else if (route.name === "ProfileTab") {
            iconText = "👤"
          }

          return <Text style={{ fontSize: size }}>{iconText}</Text>
        },
        tabBarActiveTintColor: COLORS.PRIMARY,
        tabBarInactiveTintColor: COLORS.TEXT_TERTIARY,
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          headerShown: false,
          title: "Home",
        }}
      />
      <Tab.Screen
        name="LessonsTab"
        component={LessonStackNavigator}
        options={{
          headerShown: false,
          title: "Lessons",
        }}
      />
      <Tab.Screen
        name="WordsTab"
        component={WordStackNavigator}
        options={{
          headerShown: false,
          title: "Words",
        }}
      />
      <Tab.Screen
        name="QuizzesTab"
        component={QuizStackNavigator}
        options={{
          headerShown: false,
          title: "Quizzes",
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          headerShown: false,
          title: "Profile",
        }}
      />
    </Tab.Navigator>
  )
}

// Loading Screen Component
const LoadingScreen = () => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.BACKGROUND }}>
      <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      <Text style={{ marginTop: 16, color: COLORS.TEXT_PRIMARY }}>Đang kiểm tra đăng nhập...</Text>
    </View>
  )
}

// Main app navigator
const AppNavigator = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated, isLoading, isInitialized } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    // Check authentication status when app starts
    dispatch(checkAuthStatus())
  }, [dispatch])

  // Show loading screen while checking auth status
  if (!isInitialized || isLoading) {
    return <LoadingScreen />
  }

  return <NavigationContainer>{isAuthenticated ? <MainTabNavigator /> : <AuthStackNavigator />}</NavigationContainer>
}

export default AppNavigator
