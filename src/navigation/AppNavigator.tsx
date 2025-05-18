// src/navigation/AppNavigator.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Text } from "react-native";
import { COLORS } from "../constants/colors";

// Import screens
import HomeScreen from "../screens/HomeScreen";
import LessonScreen from "../screens/LessonScreen";
import QuizScreen from "../screens/QuizScreen";
import ProfileScreen from "../screens/ProfileScreen";
import WordListScreen from "../screens/WordListScreen";
import WordDetailScreen from "../screens/WordDetailScreen";
import QuizDetailScreen from "../screens/QuizDetailScreen";

// Create navigation stacks/tabs
const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const LessonStack = createStackNavigator();
const QuizStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const WordStack = createStackNavigator();

// Home stack navigator
const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Home" component={HomeScreen} options={{ title: "Dashboard" }} />
    </HomeStack.Navigator>
  );
};

// Lesson stack navigator
const LessonStackNavigator = () => {
  return (
    <LessonStack.Navigator>
      <LessonStack.Screen name="Lessons" component={LessonScreen} options={{ title: "Lessons" }} />
    </LessonStack.Navigator>
  );
};

// Quiz stack navigator
const QuizStackNavigator = () => {
  return (
    <QuizStack.Navigator>
      <QuizStack.Screen name="Quizzes" component={QuizScreen} options={{ title: "Quizzes" }} />
      <QuizStack.Screen name="QuizDetail" component={QuizDetailScreen} options={{ title: "Quiz" }} />
    </QuizStack.Navigator>
  );
};

// Profile stack navigator
const ProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} options={{ title: "My Profile" }} />
    </ProfileStack.Navigator>
  );
};

// Word stack navigator
const WordStackNavigator = () => {
  return (
    <WordStack.Navigator>
      <WordStack.Screen name="Words" component={WordListScreen} options={{ title: "Vocabulary" }} />
      <WordStack.Screen name="WordDetail" component={WordDetailScreen} options={{ title: "Word Details" }} />
    </WordStack.Navigator>
  );
};

// Main app navigator with tabs
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            // You'd typically use icons here, but for simplicity we're using text
            let iconText;

            if (route.name === "HomeTab") {
              iconText = "🏠";
            } else if (route.name === "LessonsTab") {
              iconText = "📚";
            } else if (route.name === "WordsTab") {
              iconText = "📝";
            } else if (route.name === "QuizzesTab") {
              iconText = "✏️";
            } else if (route.name === "ProfileTab") {
              iconText = "👤";
            }

            return <Text style={{ fontSize: size }}>{iconText}</Text>;
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
    </NavigationContainer>
  );
};

export default AppNavigator;