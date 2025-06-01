"use client"

// src/screens/LessonScreen.tsx
import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native"
import { COLORS } from "../constants/colors"

const { width } = Dimensions.get("window")

interface Lesson {
  id: number
  title: string
  description: string
  level: "beginner" | "intermediate" | "advanced"
  duration: number
  progress: number
  isCompleted: boolean
  isLocked: boolean
}

const LessonScreen = ({ navigation }: any) => {
  // Mock data - replace with real data from API
  const [lessons] = useState<Lesson[]>([
    {
      id: 1,
      title: "Giới thiệu bản thân",
      description: "Học cách giới thiệu tên, tuổi và nghề nghiệp",
      level: "beginner",
      duration: 15,
      progress: 100,
      isCompleted: true,
      isLocked: false,
    },
    {
      id: 2,
      title: "Gia đình và bạn bè",
      description: "Từ vựng về các thành viên trong gia đình",
      level: "beginner",
      duration: 20,
      progress: 60,
      isCompleted: false,
      isLocked: false,
    },
    {
      id: 3,
      title: "Thời gian và ngày tháng",
      description: "Cách nói giờ, ngày, tháng, năm",
      level: "beginner",
      duration: 25,
      progress: 0,
      isCompleted: false,
      isLocked: false,
    },
    {
      id: 4,
      title: "Mua sắm và thanh toán",
      description: "Từ vựng và câu giao tiếp khi mua sắm",
      level: "intermediate",
      duration: 30,
      progress: 0,
      isCompleted: false,
      isLocked: true,
    },
    {
      id: 5,
      title: "Đặt phòng khách sạn",
      description: "Giao tiếp trong khách sạn và nhà hàng",
      level: "intermediate",
      duration: 35,
      progress: 0,
      isCompleted: false,
      isLocked: true,
    },
  ])

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return COLORS.SUCCESS
      case "intermediate":
        return COLORS.WARNING
      case "advanced":
        return COLORS.ERROR
      default:
        return COLORS.PRIMARY
    }
  }

  const getLevelText = (level: string) => {
    switch (level) {
      case "beginner":
        return "Cơ bản"
      case "intermediate":
        return "Trung cấp"
      case "advanced":
        return "Nâng cao"
      default:
        return "Cơ bản"
    }
  }

  const handleLessonPress = (lesson: Lesson) => {
    if (lesson.isLocked) {
      return
    }
    // Navigate to lesson detail
    console.log("Navigate to lesson:", lesson.id)
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bài học</Text>
        <Text style={styles.headerSubtitle}>Chọn bài học phù hợp với trình độ của bạn</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Overview */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>📈 Tiến độ học tập</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressNumber}>2/5</Text>
              <Text style={styles.progressLabel}>Bài học hoàn thành</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: "40%" }]} />
            </View>
          </View>
        </View>

        {/* Lessons List */}
        <View style={styles.lessonsSection}>
          <Text style={styles.sectionTitle}>📚 Danh sách bài học</Text>

          {lessons.map((lesson, index) => (
            <TouchableOpacity
              key={lesson.id}
              style={[
                styles.lessonCard,
                lesson.isLocked && styles.lockedCard,
                lesson.isCompleted && styles.completedCard,
              ]}
              onPress={() => handleLessonPress(lesson)}
              disabled={lesson.isLocked}
              activeOpacity={lesson.isLocked ? 1 : 0.7}
            >
              <View style={styles.lessonContent}>
                {/* Lesson Number */}
                <View
                  style={[
                    styles.lessonNumber,
                    { backgroundColor: lesson.isCompleted ? COLORS.SUCCESS : COLORS.PRIMARY },
                  ]}
                >
                  {lesson.isCompleted ? (
                    <Text style={styles.lessonNumberText}>✓</Text>
                  ) : lesson.isLocked ? (
                    <Text style={styles.lessonNumberText}>🔒</Text>
                  ) : (
                    <Text style={styles.lessonNumberText}>{index + 1}</Text>
                  )}
                </View>

                {/* Lesson Info */}
                <View style={styles.lessonInfo}>
                  <View style={styles.lessonHeader}>
                    <Text style={[styles.lessonTitle, lesson.isLocked && styles.lockedText]}>{lesson.title}</Text>
                    <View style={[styles.levelBadge, { backgroundColor: getLevelColor(lesson.level) + "20" }]}>
                      <Text style={[styles.levelText, { color: getLevelColor(lesson.level) }]}>
                        {getLevelText(lesson.level)}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.lessonDescription, lesson.isLocked && styles.lockedText]}>
                    {lesson.description}
                  </Text>

                  <View style={styles.lessonMeta}>
                    <Text style={styles.duration}>⏱️ {lesson.duration} phút</Text>
                    {lesson.progress > 0 && !lesson.isCompleted && (
                      <Text style={styles.progress}>{lesson.progress}% hoàn thành</Text>
                    )}
                  </View>

                  {/* Progress Bar for ongoing lessons */}
                  {lesson.progress > 0 && !lesson.isCompleted && (
                    <View style={styles.lessonProgressBar}>
                      <View style={[styles.lessonProgressFill, { width: `${lesson.progress}%` }]} />
                    </View>
                  )}
                </View>

                {/* Arrow */}
                {!lesson.isLocked && (
                  <View style={styles.arrowContainer}>
                    <Text style={styles.arrow}>→</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Study Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>💡 Gợi ý học tập</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>🎯</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Học theo thứ tự</Text>
              <Text style={styles.tipDescription}>Hoàn thành các bài học theo thứ tự để đạt hiệu quả tốt nhất</Text>
            </View>
          </View>

          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>🔄</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Ôn tập thường xuyên</Text>
              <Text style={styles.tipDescription}>Quay lại các bài học cũ để củng cố kiến thức</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.WHITE,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.WHITE,
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  progressSection: {
    padding: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 16,
  },
  progressCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 20,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  progressNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.PRIMARY,
    marginRight: 12,
  },
  progressLabel: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.GRAY,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 4,
  },
  lessonsSection: {
    padding: 20,
    paddingTop: 10,
  },
  lessonCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lockedCard: {
    opacity: 0.6,
  },
  completedCard: {
    borderWidth: 2,
    borderColor: COLORS.SUCCESS + "30",
  },
  lessonContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  lessonNumber: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  lessonNumberText: {
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: "bold",
  },
  lessonInfo: {
    flex: 1,
  },
  lessonHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
    marginRight: 12,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 12,
    fontWeight: "600",
  },
  lessonDescription: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 12,
    lineHeight: 20,
  },
  lessonMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  duration: {
    fontSize: 12,
    color: COLORS.TEXT_TERTIARY,
  },
  progress: {
    fontSize: 12,
    color: COLORS.PRIMARY,
    fontWeight: "500",
  },
  lessonProgressBar: {
    height: 4,
    backgroundColor: COLORS.GRAY,
    borderRadius: 2,
    marginTop: 8,
    overflow: "hidden",
  },
  lessonProgressFill: {
    height: "100%",
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 2,
  },
  lockedText: {
    color: COLORS.TEXT_TERTIARY,
  },
  arrowContainer: {
    marginLeft: 12,
  },
  arrow: {
    fontSize: 20,
    color: COLORS.PRIMARY,
    fontWeight: "bold",
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
    marginBottom: 12,
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

export default LessonScreen
