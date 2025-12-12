// src/screens/LessonDetailScreen.tsx
import { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native'
import { useDispatch } from 'react-redux'
import { getLessonById, updateLessonProgress } from '../services/LessonService'
import type { Lesson, LessonSection, TheorySection, VocabularySection } from '../types/lesson'
import { COLORS } from '../constants/colors'
import { AppDispatch } from '../store/store'

const LessonDetailScreen = ({ route, navigation }: any) => {
  const { lessonId } = route.params
  const dispatch = useDispatch<AppDispatch>()

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchLesson()
  }, [])

  const fetchLesson = async () => {
    try {
      setLoading(true)
      const lessonData = await getLessonById(lessonId)
      setLesson(lessonData)
      setCurrentSectionIndex(lessonData.current_section || 0)
    } catch (error: any) {
      Alert.alert('Lỗi', 'Không thể tải bài học')
      navigation.goBack()
    } finally {
      setLoading(false)
    }
  }

  const calculateProgress = () => {
    if (!lesson?.content?.sections) return 0
    const totalSections = lesson.content.sections.length
    return Math.round((completedSections.size / totalSections) * 100)
  }

  const handleSectionComplete = async () => {
    if (!lesson) return

    const newCompleted = new Set(completedSections)
    newCompleted.add(currentSectionIndex)
    setCompletedSections(newCompleted)

    const progress = Math.round((newCompleted.size / (lesson.content?.sections.length || 1)) * 100)

    try {
      await updateLessonProgress(lessonId, progress, currentSectionIndex)

      if (progress >= 100 && lesson.has_quiz) {
        Alert.alert(
          'Hoàn thành bài học!',
          'Bạn đã hoàn thành tất cả phần học. Hãy làm quiz để mở khóa bài học tiếp theo!',
          [
            {
              text: 'Làm Quiz',
              onPress: () => navigation.navigate('LessonQuiz', { lessonId: lesson.id }),
            },
            { text: 'Để sau', style: 'cancel' },
          ]
        )
      } else if (progress >= 100) {
        Alert.alert('Hoàn thành!', 'Bạn đã hoàn thành bài học này!')
      }
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  const handleNext = () => {
    if (!lesson?.content?.sections) return

    if (currentSectionIndex < lesson.content.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1)
    } else {
      handleSectionComplete()
    }
  }

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1)
    }
  }

  const renderTheorySection = (section: TheorySection) => (
    <View style={styles.sectionContent}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      {section.image_url && (
        <Image source={{ uri: section.image_url }} style={styles.sectionImage} resizeMode="contain" />
      )}
      <Text style={styles.theoryContent}>{section.content}</Text>
      {section.examples && section.examples.length > 0 && (
        <View style={styles.examplesContainer}>
          <Text style={styles.examplesTitle}>Ví dụ:</Text>
          {section.examples.map((example, index) => (
            <View key={index} style={styles.exampleItem}>
              <Text style={styles.exampleSentence}>{example.sentence}</Text>
              <Text style={styles.exampleTranslation}>{example.translation}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )

  const renderVocabularySection = (section: VocabularySection) => (
    <View style={styles.sectionContent}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {section.items.map((item, index) => (
          <View key={index} style={styles.vocabCard}>
            {item.image_url && (
              <Image source={{ uri: item.image_url }} style={styles.vocabImage} resizeMode="cover" />
            )}
            <View style={styles.vocabContent}>
              <Text style={styles.vocabWord}>{item.word}</Text>
              {item.pronunciation && <Text style={styles.vocabPronunciation}>{item.pronunciation}</Text>}
              <Text style={styles.vocabMeaning}>{item.meaning}</Text>
              {item.example && (
                <View style={styles.vocabExample}>
                  <Text style={styles.vocabExampleText}>{item.example}</Text>
                  {item.example_translation && (
                    <Text style={styles.vocabExampleTranslation}>{item.example_translation}</Text>
                  )}
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  )

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Đang tải bài học...</Text>
      </View>
    )
  }

  if (!lesson || !lesson.content?.sections || lesson.content.sections.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Không tìm thấy nội dung bài học</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const currentSection = lesson.content.sections[currentSectionIndex]
  const progress = calculateProgress()

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Quay lại</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            Section {currentSectionIndex + 1}/{lesson.content.sections.length} - {progress}% hoàn thành
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {currentSection.type === 'theory' && renderTheorySection(currentSection as TheorySection)}
        {currentSection.type === 'vocabulary' && renderVocabularySection(currentSection as VocabularySection)}
        {currentSection.type === 'practice' && (
          <View style={styles.practiceSection}>
            <Text style={styles.sectionTitle}>{currentSection.title}</Text>
            <Text style={styles.practiceText}>Phần luyện tập được tích hợp trong Quiz</Text>
          </View>
        )}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={[styles.navButton, currentSectionIndex === 0 && styles.disabledButton]}
          onPress={handlePrevious}
          disabled={currentSectionIndex === 0}
        >
          <Text style={styles.navButtonText}>← Trước</Text>
        </TouchableOpacity>

        {currentSectionIndex === lesson.content.sections.length - 1 ? (
          <TouchableOpacity style={[styles.navButton, styles.completeButton]} onPress={handleSectionComplete}>
            <Text style={styles.navButtonText}>Hoàn thành ✓</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.navButton} onPress={handleNext}>
            <Text style={styles.navButtonText}>Tiếp →</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Quiz Button (if available) */}
      {lesson.has_quiz && progress >= 100 && (
        <View style={styles.quizButtonContainer}>
          <TouchableOpacity
            style={styles.quizButton}
            onPress={() => navigation.navigate('LessonQuiz', { lessonId: lesson.id })}
          >
            <Text style={styles.quizButtonText}>
              {lesson.quiz_passed ? '✓ Quiz đã hoàn thành' : '🎯 Làm Quiz'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    backgroundColor: COLORS.PRIMARY,
    padding: 15,
    paddingTop: 50,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
  },
  headerInfo: {
    marginTop: 10,
  },
  lessonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.SUCCESS,
  },
  progressText: {
    color: COLORS.WHITE,
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  sectionContent: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: 15,
  },
  sectionImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  theoryContent: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.TEXT,
    marginBottom: 15,
  },
  examplesContainer: {
    backgroundColor: COLORS.BACKGROUND,
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: COLORS.TEXT,
  },
  exampleItem: {
    marginBottom: 10,
  },
  exampleSentence: {
    fontSize: 15,
    color: COLORS.TEXT,
    fontStyle: 'italic',
  },
  exampleTranslation: {
    fontSize: 14,
    color: COLORS.GRAY,
    marginTop: 5,
  },
  vocabCard: {
    width: 280,
    backgroundColor: COLORS.WHITE,
    borderRadius: 15,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  vocabImage: {
    width: '100%',
    height: 150,
  },
  vocabContent: {
    padding: 15,
  },
  vocabWord: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginBottom: 5,
  },
  vocabPronunciation: {
    fontSize: 14,
    color: COLORS.GRAY,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  vocabMeaning: {
    fontSize: 16,
    color: COLORS.TEXT,
    marginBottom: 10,
  },
  vocabExample: {
    backgroundColor: COLORS.BACKGROUND,
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
  },
  vocabExampleText: {
    fontSize: 14,
    color: COLORS.TEXT,
    fontStyle: 'italic',
  },
  vocabExampleTranslation: {
    fontSize: 13,
    color: COLORS.GRAY,
    marginTop: 5,
  },
  practiceSection: {
    padding: 20,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 10,
  },
  practiceText: {
    fontSize: 16,
    color: COLORS.GRAY,
    textAlign: 'center',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    backgroundColor: COLORS.WHITE,
  },
  navButton: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  completeButton: {
    backgroundColor: COLORS.SUCCESS,
  },
  disabledButton: {
    backgroundColor: COLORS.GRAY,
  },
  navButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  quizButtonContainer: {
    padding: 15,
    backgroundColor: COLORS.BACKGROUND,
  },
  quizButton: {
    backgroundColor: COLORS.WARNING,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  quizButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.GRAY,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.ERROR,
    marginBottom: 20,
  },
  button: {
    backgroundColor: COLORS.PRIMARY,
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: COLORS.WHITE,
    fontSize: 16,
  },
})

export default LessonDetailScreen