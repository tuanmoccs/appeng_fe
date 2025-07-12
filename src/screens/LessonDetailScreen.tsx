// src/screens/LessonDetailScreen.tsx
import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native"
import { COLORS } from "../constants/colors"
import Button from "../components/Button"
import { getLessonById, updateLessonProgress, completeLesson } from "../services/LessonService"
import type { Lesson, LessonItem } from "../types/lesson"
import { styles } from "../styles/LessonDetailScreen.styles"
const { width } = Dimensions.get("window")

const LessonDetailScreen = ({ route, navigation }: any) => {
  const { lessonId } = route.params
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentSection, setCurrentSection] = useState(0)
  const [currentItem, setCurrentItem] = useState(0)
  const [showMeaning, setShowMeaning] = useState(false)
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchLesson()
  }, [lessonId])

  const fetchLesson = async () => {
    try {
      setLoading(true)
      const lessonData = await getLessonById(lessonId)
      setLesson(lessonData)
      setCurrentSection(lessonData.current_section || 0)
      setCurrentItem(lessonData.current_item || 0)
    } catch (error: any) {
      Alert.alert("Lỗi", "Không thể tải bài học")
      navigation.goBack()
    } finally {
      setLoading(false)
    }
  }

  const calculateProgress = (currentSec?: number, currentIt?: number, completedSet?: Set<string>) => {
    // Sử dụng giá trị hiện tại nếu không có tham số truyền vào
    const sec = currentSec !== undefined ? currentSec : currentSection;
    const it = currentIt !== undefined ? currentIt : currentItem;
    const completed = completedSet || completedItems;

    if (!lesson?.content?.sections) return 0

    let totalItems = 0
    let completedCount = 0

    lesson.content.sections.forEach((section, sectionIndex) => {
      section.items.forEach((item, itemIndex) => {
        totalItems++

        // Item được coi là hoàn thành nếu:
        // 1. Đã được đánh dấu completed
        // 2. Thuộc section đã qua
        // 3. Thuộc section hiện tại và index <= current item
        const itemKey = `${sectionIndex}-${itemIndex}`
        const isInCompletedSection = sectionIndex < sec
        const isCurrentSectionCompletedItem = sectionIndex === sec && itemIndex <= it
        const isMarkedCompleted = completed.has(itemKey)

        if (isInCompletedSection || isCurrentSectionCompletedItem || isMarkedCompleted) {
          completedCount++
        }
      })
    })

    return totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0
  }

  const updateProgress = async () => {
    if (!lesson) return

    const progress = calculateProgress()
    try {
      await updateLessonProgress(lesson.id, progress, currentSection, currentItem)
    } catch (error) {
      console.error("Error updating progress:", error)
    }
  }

  const handleNextItem = () => {
    if (!lesson?.content?.sections) return

    const currentSectionData = lesson.content.sections[currentSection]
    const itemKey = `${currentSection}-${currentItem}`

    // Tạo set mới với item hiện tại được đánh dấu completed
    const newCompletedItems = new Set([...completedItems, itemKey])

    let newSection = currentSection
    let newItem = currentItem

    if (currentItem < currentSectionData.items.length - 1) {
      // Next item in current section
      newItem = currentItem + 1
    } else if (currentSection < lesson.content.sections.length - 1) {
      // Next section
      newSection = currentSection + 1
      newItem = 0
    } else {
      // Lesson completed - tự động hoàn thành với 100%
      handleCompleteLesson()
      return
    }
    const newProgress = calculateProgress(newSection, newItem, newCompletedItems)

      // Cập nhật state
      setCompletedItems(newCompletedItems)
      setCurrentSection(newSection)
      setCurrentItem(newItem)
      setShowMeaning(false)

      // Cập nhật progress lên server
      updateProgressToServer(newProgress, newSection, newItem)
  }

  const updateProgressToServer = async (progress: number, section?: number, item?: number) => {
    if (!lesson) return

    const sec = section !== undefined ? section : currentSection
    const it = item !== undefined ? item : currentItem

    try {
      await updateLessonProgress(lesson.id, progress, sec, it)
    } catch (error) {
      console.error("Error updating progress:", error)
    }
  }

  const handlePreviousItem = () => {
    if (currentItem > 0) {
      setCurrentItem(currentItem - 1)
    } else if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
      const prevSectionData = lesson?.content?.sections[currentSection - 1]
      if (prevSectionData) {
        setCurrentItem(prevSectionData.items.length - 1)
      }
    }
    setShowMeaning(false)
    updateProgress()
  }

  const handleCompleteLesson = async () => {
    if (!lesson) return

    try {
      const result = await completeLesson(lesson.id)

      Alert.alert("🎉 Chúc mừng!", "Bạn đã hoàn thành bài học!", [
        {
          text: "Tiếp tục",
          onPress: () => navigation.goBack(),
        },
      ])

      // Show achievements if any
      if (result.achievements && result.achievements.length > 0) {
        setTimeout(() => {
          result.achievements.forEach((achievement: any) => {
            Alert.alert("🏆 Thành tích mới!", `${achievement.title}\n${achievement.description}`)
          })
        }, 1000)
      }
    } catch (error: any) {
      Alert.alert("Lỗi", "Không thể hoàn thành bài học")
    }
  }

  const getCurrentItem = (): LessonItem | null => {
    if (!lesson?.content?.sections) return null
    const section = lesson.content.sections[currentSection]
    return section?.items[currentItem] || null
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

  useEffect(() => {
    if (lesson && lesson.content?.sections) {
      // Tính toán lại progress dựa trên current position
      const newProgress = calculateProgress()
      if (newProgress !== lesson.progress) {
        updateProgressToServer(newProgress)
      }
    }
  }, [currentSection, currentItem, completedItems])

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    )
  }

  if (!lesson) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Không tìm thấy bài học</Text>
        <Button title="Quay lại" onPress={() => navigation.goBack()} />
      </View>
    )
  }

  const currentItemData = getCurrentItem()
  const progress = calculateProgress()
  const totalSections = lesson.content?.sections.length || 0
  const totalItems = lesson.content?.sections.reduce((sum, section) => sum + section.items.length, 0) || 0
  const currentItemNumber =
    (lesson.content?.sections
      ?.slice(0, currentSection)
      .reduce((sum, section) => sum + (section.items?.length ?? 0), 0) ?? 0) +
    currentItem +
    1

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Quay lại</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          <View style={[styles.levelBadge, { backgroundColor: getLevelColor(lesson.level) + "20" }]}>
            <Text style={[styles.levelText, { color: getLevelColor(lesson.level) }]}>{getLevelText(lesson.level)}</Text>
          </View>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            {currentItemNumber}/{totalItems} • {progress}%
          </Text>
          <Text style={styles.sectionText}>
            Phần {currentSection + 1}/{totalSections}: {lesson.content?.sections[currentSection]?.title}
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {currentItemData && (
          <View style={styles.itemCard}>
            <View style={styles.wordContainer}>
              <Text style={styles.word}>{currentItemData.word}</Text>
              <TouchableOpacity style={styles.showMeaningButton} onPress={() => setShowMeaning(!showMeaning)}>
                <Text style={styles.showMeaningButtonText}>{showMeaning ? "Ẩn nghĩa" : "Hiện nghĩa"}</Text>
              </TouchableOpacity>
            </View>

            {showMeaning && (
              <View style={styles.meaningContainer}>
                <Text style={styles.meaning}>{currentItemData.meaning}</Text>
              </View>
            )}

            <View style={styles.exampleContainer}>
              <Text style={styles.exampleLabel}>Ví dụ:</Text>
              <Text style={styles.example}>{currentItemData.example}</Text>
            </View>
          </View>
        )}

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[
              styles.navButton,
              styles.prevButton,
              currentSection === 0 && currentItem === 0 && styles.disabledButton,
            ]}
            onPress={handlePreviousItem}
            disabled={currentSection === 0 && currentItem === 0}
          >
            <Text
              style={[styles.navButtonText, currentSection === 0 && currentItem === 0 && styles.disabledButtonText]}
            >
              ← Trước
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.navButton, styles.nextButton]} onPress={handleNextItem}>
            <Text style={styles.navButtonText}>
              {currentSection === totalSections - 1 &&
              currentItem === (lesson.content?.sections[currentSection]?.items.length || 1) - 1
                ? "Hoàn thành"
                : "Tiếp theo →"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

export default LessonDetailScreen
