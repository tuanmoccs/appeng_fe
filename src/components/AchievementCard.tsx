// src/components/AchievementCard.tsx
import type React from "react"
import { View, Text, StyleSheet } from "react-native"
import { COLORS } from "../constants/colors"

interface AchievementCardProps {
  title: string
  description: string
  achievedAt: string
  type: string
}

const AchievementCard: React.FC<AchievementCardProps> = ({ title, description, achievedAt, type }) => {
  const getAchievementIcon = (type: string) => {
    switch (type) {
      case "quiz_perfect":
        return "🏆"
      case "first_quiz":
        return "🎯"
      case "five_quizzes":
        return "🌟"
      case "streak":
        return "🔥"
      default:
        return "🎖️"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN")
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{getAchievementIcon(type)}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <Text style={styles.date}>Đạt được: {formatDate(achievedAt)}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    marginRight: 16,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.PRIMARY_LIGHT + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: COLORS.TEXT_TERTIARY,
  },
})

export default AchievementCard
