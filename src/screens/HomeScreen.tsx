"use client"

// src/screens/HomeScreen.tsx
import { useEffect, useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native"
import { useSelector } from "react-redux"
import { COLORS } from "../constants/colors"
import StatCard from "../components/StatCard"
import { getUserStats } from "../services/profileService"
import type { RootState } from "../store/store"
import type { UserStats } from "../services/profileService"
import { styles } from "../styles/HomeScreen.styles"
const HomeScreen = ({ navigation }: any) => {
  const { user } = useSelector((state: RootState) => state.auth)
  const [stats, setStats] = useState<UserStats | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const statsData = await getUserStats()
      setStats(statsData)
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 18) return "Good Afternoon"
    return "Good Evening"
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.greetingSection}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{user?.name}! 👋</Text>
            <Text style={styles.subtitle}>What do you want to learn today?</Text>
          </View>
          <TouchableOpacity style={styles.avatarContainer} onPress={() => navigation.navigate("ProfileTab")}>
            <Image
              source={user?.avatar ? { uri: user.avatar } : require("../assets/images/th.jpg")}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Stats */}
      {stats && (
        <View style={styles.quickStats}>
          <Text style={styles.sectionTitle}>📊 Today's progress</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <StatCard title="Streak" value={`${stats.current_streak} days`} icon="🔥" color={COLORS.WARNING} />
            </View>
            <View style={styles.statItem}>
              <StatCard
                title="Completed Quizz"
                value={stats.total_quizzes_completed}
                icon="✅"
                color={COLORS.SUCCESS}
              />
            </View>
          </View>
        </View>
      )}

      {/* Main Actions */}
      <View style={styles.mainActions}>
        <Text style={styles.sectionTitle}>🚀 Start</Text>

        <TouchableOpacity style={styles.primaryCard} onPress={() => navigation.navigate("Lessons")}>
          <View style={styles.cardContent}>
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>📚</Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>New Lesson</Text>
              <Text style={styles.cardDescription}>Explore structured lessons from beginner to advanced</Text>
            </View>
            <View style={styles.cardArrow}>
              <Text style={styles.arrowText}>→</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.secondaryCards}>
          <TouchableOpacity style={styles.secondaryCard} onPress={() => navigation.navigate("Words")}>
            <View style={styles.secondaryCardIcon}>
              <Text style={styles.secondaryCardIconText}>📝</Text>
            </View>
            <Text style={styles.secondaryCardTitle}>Vocabulary</Text>
            <Text style={styles.secondaryCardDescription}>Learn new words with pictures and examples</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryCard} onPress={() => navigation.navigate("Tests")}>
            <View style={styles.secondaryCardIcon}>
              <Text style={styles.secondaryCardIconText}>🧠</Text>
            </View>
            <Text style={styles.secondaryCardTitle}>Test</Text>
            <Text style={styles.secondaryCardDescription}>Challenge yourself with quizzes</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Learning Tips */}
      <View style={styles.tipsSection}>
        <Text style={styles.sectionTitle}>💡 Hint</Text>
        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>🎯</Text>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Study regularly every day</Text>
            <Text style={styles.tipDescription}>
              Just 15-20 minutes a day to maintain and improve your language skills
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

export default HomeScreen
