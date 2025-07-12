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
import type { Lesson } from "../types/lesson"
import { styles } from "../styles/LessonScreen.styles"
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
export default LessonScreen
