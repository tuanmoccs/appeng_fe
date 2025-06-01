// src/components/StatCard.tsx
import type React from "react"
import { View, Text, StyleSheet } from "react-native"
import { COLORS } from "../constants/colors"

interface StatCardProps {
  title: string
  value: string | number
  icon: string
  color?: string
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color = COLORS.PRIMARY }) => {
  return (
    <View style={[styles.container, { borderLeftColor: color }]}>
      <View style={styles.iconContainer}>
        <Text style={[styles.icon, { color }]}>{icon}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.title}>{title}</Text>
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
    borderLeftWidth: 4,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 12,
  },
  iconContainer: {
    marginRight: 16,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  value: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
})

export default StatCard
