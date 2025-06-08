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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    backgroundColor: COLORS.PRIMARY,
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greetingSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: COLORS.WHITE,
    opacity: 0.9,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.WHITE,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.WHITE,
    opacity: 0.8,
  },
  avatarContainer: {
    marginLeft: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: COLORS.WHITE,
  },
  quickStats: {
    padding: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statItem: {
    flex: 1,
  },
  mainActions: {
    padding: 20,
    paddingTop: 10,
  },
  primaryCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.PRIMARY_LIGHT + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardIconText: {
    fontSize: 24,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
  },
  cardArrow: {
    marginLeft: 12,
  },
  arrowText: {
    fontSize: 20,
    color: COLORS.PRIMARY,
    fontWeight: "bold",
  },
  secondaryCards: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryCard: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryCardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.SECONDARY + "20",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  secondaryCardIconText: {
    fontSize: 20,
  },
  secondaryCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
    textAlign: "center",
  },
  secondaryCardDescription: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    textAlign: "center",
    lineHeight: 16,
  },
  tipsSection: {
    padding: 20,
    paddingTop: 10,
  },
  tipCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
  },
})

export default HomeScreen
