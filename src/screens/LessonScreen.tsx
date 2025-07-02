// src/screens/LessonScreen.tsx
import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native"
import { useDispatch, useSelector } from "react-redux"
import { useFocusEffect } from "@react-navigation/native"
import { COLORS } from "../constants/colors"
import { fetchLessons, fetchLessonStats } from "../store/slices/lessonSlice"
import type { RootState, AppDispatch } from "../store/store"
import type { Lesson } from "../services/LessonService"

const { width } = Dimensions.get("window")

const LessonScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>()
  const { lessons, stats, isLoading, error } = useSelector((state: RootState) => state.lesson)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadData()
  }, [])
  
  const loadData = async () => {
    try {
      await Promise.all([dispatch(fetchLessons()).unwrap(), dispatch(fetchLessonStats()).unwrap()]) //Lấy danh sách bài học và thống kê tiến độ
    } catch (error: any) {
      console.error("Error loading lesson data:", error)
      Alert.alert("Lỗi", "Không thể tải dữ liệu bài học")
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

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
    if (lesson.is_locked) {
      Alert.alert("Bài học bị khóa", "Bạn cần hoàn thành bài học trước đó để mở khóa bài học này.")
      return
    }
    // Chuyển đến màn hình học chi tiết, truyền ID bài học
    navigation.navigate("LessonDetail", { lessonId: lesson.id })
  }

  if (isLoading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Đang tải bài học...</Text>
      </View>
    )
  }

  if (error && lessons.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    )
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.PRIMARY]} />}
      >
        {/* Progress Overview */}
        {stats && (
          <View style={styles.progressSection}>
            <Text style={styles.sectionTitle}>📈 Tiến độ học tập</Text>
            <View style={styles.progressCard}>
              <View style={styles.progressInfo}>
                <Text style={styles.progressNumber}>
                  {stats.completed_lessons}/{stats.total_lessons}
                </Text>
                <Text style={styles.progressLabel}>Bài học hoàn thành</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${stats.completion_rate}%` }]} />
              </View>
              <Text style={styles.progressPercentage}>{stats.completion_rate}% hoàn thành</Text>
            </View>
          </View>
        )}

        {/* Lessons List */}
        <View style={styles.lessonsSection}>
          <Text style={styles.sectionTitle}>📚 Danh sách bài học</Text>

          {lessons.map((lesson, index) => (
            <TouchableOpacity
              key={lesson.id}
              style={[
                styles.lessonCard,
                lesson.is_locked && styles.lockedCard,
                lesson.is_completed && styles.completedCard,
              ]}
              onPress={() => handleLessonPress(lesson)}
              disabled={lesson.is_locked}
              activeOpacity={lesson.is_locked ? 1 : 0.7}
            >
              <View style={styles.lessonContent}>
                {/* Lesson Number */}
                <View
                  style={[
                    styles.lessonNumber,
                    {
                      backgroundColor: lesson.is_completed
                        ? COLORS.SUCCESS
                        : lesson.is_locked
                          ? COLORS.GRAY
                          : COLORS.PRIMARY,
                    },
                  ]}
                >
                  {lesson.is_completed ? (
                    <Text style={styles.lessonNumberText}>✓</Text>
                  ) : lesson.is_locked ? (
                    <Text style={styles.lessonNumberText}>🔒</Text>
                  ) : (
                    <Text style={styles.lessonNumberText}>{lesson.order}</Text>
                  )}
                </View>

                {/* Lesson Info */}
                <View style={styles.lessonInfo}>
                  <View style={styles.lessonHeader}>
                    <Text style={[styles.lessonTitle, lesson.is_locked && styles.lockedText]}>{lesson.title}</Text>
                    <View style={[styles.levelBadge, { backgroundColor: getLevelColor(lesson.level) + "20" }]}>
                      <Text style={[styles.levelText, { color: getLevelColor(lesson.level) }]}>
                        {getLevelText(lesson.level)}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.lessonDescription, lesson.is_locked && styles.lockedText]}>
                    {lesson.description}
                  </Text>

                  <View style={styles.lessonMeta}>
                    <Text style={styles.duration}>⏱️ {lesson.duration} phút</Text>
                    {lesson.progress > 0 && !lesson.is_completed && (
                      <Text style={styles.progress}>{lesson.progress}% hoàn thành</Text>
                    )}
                    {lesson.content_preview && (
                      <Text style={styles.contentInfo}>
                        📖 {lesson.content_preview.total_sections} phần • {lesson.content_preview.total_items} mục
                      </Text>
                    )}
                  </View>

                  {/* Progress Bar for ongoing lessons */}
                  {lesson.progress > 0 && !lesson.is_completed && (
                    <View style={styles.lessonProgressBar}>
                      <View style={[styles.lessonProgressFill, { width: `${lesson.progress}%` }]} />
                    </View>
                  )}
                </View>

                {/* Arrow */}
                {!lesson.is_locked && (
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.BACKGROUND,
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.ERROR,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: "600",
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
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: "center",
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
    flexWrap: "wrap",
    gap: 8,
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
  contentInfo: {
    fontSize: 12,
    color: COLORS.TEXT_TERTIARY,
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
