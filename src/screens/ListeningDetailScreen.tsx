"use client"

import { useEffect, useState, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  BackHandler,
  ScrollView,
} from "react-native"
import Sound from "react-native-sound"
import { COLORS } from "../constants/colors"
import ListeningQuestion from "../components/ListeningQuestion"
import { getListeningTestById, submitListeningTest } from "../services/listeningtestService"
import type { ListeningTest, ListeningAnswer, ListeningResult } from "../services/listeningtestService"

// Enable playback in silence mode
Sound.setCategory("Playback")

const ListeningDetailScreen = ({ route, navigation }: any) => {
  const { testId } = route.params

  const [test, setTest] = useState<ListeningTest | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({})
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [testResult, setTestResult] = useState<ListeningResult | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [sound, setSound] = useState<Sound | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioPosition, setAudioPosition] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [startTime] = useState(Date.now())

  const audioRef = useRef<Sound | null>(null)
  const positionInterval = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchTest()

    // Handle hardware back button
    const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBackPress)
    return () => {
      backHandler.remove()
      cleanup()
    }
  }, [])

  useEffect(() => {
    // Setup timer if test has time limit
    if (test?.time_limit && timeRemaining === null && !showResult) {
      setTimeRemaining(test.time_limit * 60) // Convert minutes to seconds
    }
  }, [test])

  useEffect(() => {
    // Timer countdown
    let interval: NodeJS.Timeout | null = null

    if (timeRemaining !== null && timeRemaining > 0 && !showResult) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) {
            handleTimeUp()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timeRemaining, showResult])

  useEffect(() => {
    // Load audio when section changes
    if (test?.sections && test.sections[currentSectionIndex]) {
      loadAudio()
    }

    return () => {
      // Cleanup audio when component unmounts or section changes
      cleanup()
    }
  }, [currentSectionIndex, test])

  const cleanup = () => {
    if (positionInterval.current) {
      clearInterval(positionInterval.current)
      positionInterval.current = null
    }
    if (audioRef.current) {
      audioRef.current.stop()
      audioRef.current.release()
      audioRef.current = null
    }
  }

  const fetchTest = async () => {
    try {
      setLoading(true)
      const testData = await getListeningTestById(testId)

      // Validate test data
      if (!testData || !testData.sections || testData.sections.length === 0) {
        throw new Error("Listening test không có section hoặc dữ liệu không hợp lệ")
      }

      console.log("✅ Listening test loaded successfully:", {
        id: testData.id,
        title: testData.title,
        sectionsCount: testData.sections.length,
        totalQuestions: testData.total_questions,
      })

      setTest(testData)
    } catch (error: any) {
      console.error("❌ Error loading listening test:", error)
      Alert.alert("Lỗi", error.message || "Không thể tải listening test")
      navigation.goBack()
    } finally {
      setLoading(false)
    }
  }

  const loadAudio = async () => {
    try {
      // Cleanup previous audio
      cleanup()

      const currentSection = test?.sections[currentSectionIndex]
      if (!currentSection?.audio_url) {
        console.log("No audio URL for current section")
        return
      }

      console.log("Loading audio:", currentSection.audio_url)

      const newSound = new Sound(currentSection.audio_url, Sound.MAIN_BUNDLE, (error: any) => {
        if (error) {
          console.error("Failed to load the sound", error)
          Alert.alert("Lỗi", "Không thể tải file âm thanh")
          return
        }

        // Audio loaded successfully
        console.log("Audio loaded successfully")
        setAudioDuration(newSound.getDuration() * 1000) // Convert to milliseconds
        audioRef.current = newSound
        setSound(newSound)
      })
    } catch (error) {
      console.error("Error loading audio:", error)
      Alert.alert("Lỗi", "Không thể tải file âm thanh")
    }
  }

  const startPositionTracking = () => {
    if (positionInterval.current) {
      clearInterval(positionInterval.current)
    }

    positionInterval.current = setInterval(() => {
      if (audioRef.current && isPlaying) {
        audioRef.current.getCurrentTime((seconds: number) => {
          setAudioPosition(seconds * 1000) // Convert to milliseconds
        })
      }
    }, 100)
  }

  const stopPositionTracking = () => {
    if (positionInterval.current) {
      clearInterval(positionInterval.current)
      positionInterval.current = null
    }
  }

  const handleBackPress = () => {
    if (showResult) {
      navigation.goBack()
      return true
    }

    Alert.alert("Thoát test", "Bạn có chắc chắn muốn thoát? Tiến độ sẽ bị mất.", [
      { text: "Hủy", style: "cancel" },
      { text: "Thoát", onPress: () => navigation.goBack() },
    ])
    return true
  }

  const handleTimeUp = () => {
    Alert.alert("Hết thời gian", "Thời gian làm bài đã kết thúc. Bài test sẽ được nộp tự động.", [
      { text: "OK", onPress: handleSubmitTest },
    ])
  }

  const handlePlayPause = async () => {
    if (!audioRef.current) return

    try {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
        stopPositionTracking()
      } else {
        audioRef.current.play((success: boolean) => {
          if (success) {
            console.log("Audio played successfully")
            setIsPlaying(false)
            stopPositionTracking()
          } else {
            console.error("Audio playback failed")
            Alert.alert("Lỗi", "Không thể phát audio")
          }
        })
        setIsPlaying(true)
        startPositionTracking()
      }
    } catch (error) {
      console.error("Error playing/pausing audio:", error)
    }
  }

  const handleSeekAudio = async (positionMs: number) => {
    if (!audioRef.current) return

    try {
      const positionSeconds = positionMs / 1000
      audioRef.current.setCurrentTime(positionSeconds)
      setAudioPosition(positionMs)
    } catch (error) {
      console.error("Error seeking audio:", error)
    }
  }

  const handleSelectAnswer = (questionId: number, answer: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const handlePreviousQuestion = () => {
    const currentSection = test?.sections[currentSectionIndex]
    if (!currentSection) return

    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    } else if (currentSectionIndex > 0) {
      // Go to previous section, last question
      const prevSection = test?.sections[currentSectionIndex - 1]
      if (prevSection) {
        setCurrentSectionIndex(currentSectionIndex - 1)
        setCurrentQuestionIndex(prevSection.questions.length - 1)
      }
    }
  }

  const handleNextQuestion = () => {
    const currentSection = test?.sections[currentSectionIndex]
    if (!currentSection) return

    if (currentQuestionIndex < currentSection.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else if (currentSectionIndex < (test?.sections.length || 0) - 1) {
      // Go to next section, first question
      setCurrentSectionIndex(currentSectionIndex + 1)
      setCurrentQuestionIndex(0)
    }
  }

  const handleSubmitTest = async () => {
    if (!test?.sections) return

    // Get all questions from all sections
    const allQuestions = test.sections.flatMap((section) => section.questions)
    const unansweredQuestions = allQuestions.filter((q) => !userAnswers[q.id])

    if (unansweredQuestions.length > 0) {
      Alert.alert("Chưa hoàn thành", `Bạn còn ${unansweredQuestions.length} câu chưa trả lời. Bạn có muốn nộp bài?`, [
        { text: "Hủy", style: "cancel" },
        { text: "Nộp bài", onPress: submitAnswers },
      ])
    } else {
      Alert.alert("Nộp bài", "Bạn có chắc chắn muốn nộp bài?", [
        { text: "Hủy", style: "cancel" },
        { text: "Nộp bài", onPress: submitAnswers },
      ])
    }
  }

  const submitAnswers = async () => {
    if (!test?.sections) return

    try {
      setIsSubmitting(true)

      // Stop audio
      if (audioRef.current) {
        audioRef.current.stop()
        stopPositionTracking()
      }

      // Convert answers to required format
      const allQuestions = test.sections.flatMap((section) => section.questions)
      const answers: ListeningAnswer[] = allQuestions.map((question) => ({
        question_id: question.id,
        selected_answer: userAnswers[question.id] || "",
      }))

      const timeTaken = Math.floor((Date.now() - startTime) / 1000)
      const result = await submitListeningTest(testId, answers, timeTaken)
      setTestResult(result)
      setShowResult(true)
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Không thể nộp bài listening test")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const formatAudioTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const getCurrentQuestionNumber = () => {
    if (!test?.sections) return 0

    let questionNumber = 0
    for (let i = 0; i < currentSectionIndex; i++) {
      questionNumber += test.sections[i].questions.length
    }
    questionNumber += currentQuestionIndex + 1
    return questionNumber
  }

  const isLastQuestion = () => {
    if (!test?.sections) return false

    const isLastSection = currentSectionIndex === test.sections.length - 1
    const currentSection = test.sections[currentSectionIndex]
    const isLastQuestionInSection = currentQuestionIndex === currentSection.questions.length - 1

    return isLastSection && isLastQuestionInSection
  }

  const isFirstQuestion = () => {
    return currentSectionIndex === 0 && currentQuestionIndex === 0
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Đang tải listening test...</Text>
      </View>
    )
  }

  if (!test || !test.sections || test.sections.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Không tìm thấy listening test</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (showResult && testResult) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.resultContainer}>
        <View style={styles.resultHeader}>
          <Text style={styles.resultTitle}>Kết quả Listening Test</Text>
          <View
            style={[
              styles.scoreContainer,
              { backgroundColor: testResult.is_passed ? COLORS.SUCCESS + "20" : COLORS.ERROR + "20" },
            ]}
          >
            <Text style={[styles.scoreText, { color: testResult.is_passed ? COLORS.SUCCESS : COLORS.ERROR }]}>
              {testResult.score.toFixed(0)}%
            </Text>
          </View>
        </View>

        <View style={styles.resultStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Điểm số</Text>
            <Text style={styles.statValue}>{testResult.score.toFixed(1)}%</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Câu đúng</Text>
            <Text style={styles.statValue}>
              {testResult.correct_answers}/{testResult.total_questions}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Kết quả</Text>
            <Text style={[styles.statValue, { color: testResult.is_passed ? COLORS.SUCCESS : COLORS.ERROR }]}>
              {testResult.is_passed ? "ĐẠT" : "KHÔNG ĐẠT"}
            </Text>
          </View>
        </View>

        <View style={styles.resultActions}>
          <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>Quay lại danh sách</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    )
  }

  const currentSection = test.sections[currentSectionIndex]
  const currentQuestion = currentSection?.questions[currentQuestionIndex]

  if (!currentSection || !currentQuestion) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Đang tải câu hỏi...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backButtonText}>← Thoát</Text>
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.testTitle}>{test.title}</Text>
          {timeRemaining !== null && (
            <Text style={[styles.timer, timeRemaining < 300 ? styles.timerWarning : null]}>
              ⏱️ {formatTime(timeRemaining)}
            </Text>
          )}
        </View>
      </View>

      {/* Section Info */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Section {currentSectionIndex + 1}: {currentSection.title}
        </Text>
        {currentSection.instructions && <Text style={styles.sectionInstructions}>{currentSection.instructions}</Text>}
      </View>

      {/* Audio Player */}
      <View style={styles.audioContainer}>
        <View style={styles.audioControls}>
          <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
            <Text style={styles.playButtonText}>{isPlaying ? "⏸️" : "▶️"}</Text>
          </TouchableOpacity>

          <View style={styles.audioInfo}>
            <Text style={styles.audioTime}>
              {formatAudioTime(audioPosition)} / {formatAudioTime(audioDuration)}
            </Text>
            <TouchableOpacity
              style={styles.progressBar}
              onPress={(e) => {
                const { locationX } = e.nativeEvent
                const progressBarWidth = 200 // Approximate width
                const newPosition = (locationX / progressBarWidth) * audioDuration
                handleSeekAudio(newPosition)
              }}
            >
              <View
                style={[
                  styles.progressFill,
                  { width: `${audioDuration > 0 ? (audioPosition / audioDuration) * 100 : 0}%` },
                ]}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Section {currentSectionIndex + 1}/{test.sections.length} • Câu {getCurrentQuestionNumber()}/
          {test.total_questions} • {Object.keys(userAnswers).length} đã trả lời
        </Text>
      </View>

      {/* Question */}
      <View style={styles.questionContainer}>
        <ListeningQuestion
          question={currentQuestion.question}
          options={currentQuestion.options}
          selectedOption={userAnswers[currentQuestion.id]}
          onSelectOption={(answer) => handleSelectAnswer(currentQuestion.id, answer)}
          questionNumber={getCurrentQuestionNumber()}
          totalQuestions={test.total_questions}
        />
      </View>

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, styles.prevButton, isFirstQuestion() && styles.disabledButton]}
          onPress={handlePreviousQuestion}
          disabled={isFirstQuestion()}
        >
          <Text style={[styles.navButtonText, isFirstQuestion() && styles.disabledButtonText]}>← Câu trước</Text>
        </TouchableOpacity>

        {isLastQuestion() ? (
          <TouchableOpacity
            style={[styles.navButton, styles.submitButton]}
            onPress={handleSubmitTest}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={COLORS.WHITE} />
            ) : (
              <Text style={styles.navButtonText}>Nộp bài</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.navButton, styles.nextButton]} onPress={handleNextQuestion}>
            <Text style={styles.navButtonText}>Câu sau →</Text>
          </TouchableOpacity>
        )}
      </View>
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
  header: {
    backgroundColor: COLORS.PRIMARY,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
  },
  headerInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  testTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.WHITE,
    flex: 1,
    marginRight: 12,
  },
  timer: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.WHITE,
  },
  timerWarning: {
    color: COLORS.WARNING,
  },
  sectionHeader: {
    backgroundColor: COLORS.WHITE,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  sectionInstructions: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
  },
  audioContainer: {
    backgroundColor: COLORS.WHITE,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  audioControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: "center",
    alignItems: "center",
  },
  playButtonText: {
    fontSize: 20,
    color: COLORS.WHITE,
  },
  audioInfo: {
    flex: 1,
  },
  audioTime: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.GRAY,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 2,
  },
  progressContainer: {
    backgroundColor: COLORS.WHITE,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: "center",
  },
  questionContainer: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  navigationContainer: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    backgroundColor: COLORS.WHITE,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
  navButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  prevButton: {
    backgroundColor: COLORS.GRAY,
  },
  nextButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  submitButton: {
    backgroundColor: COLORS.SUCCESS,
  },
  disabledButton: {
    backgroundColor: COLORS.GRAY + "50",
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.WHITE,
  },
  disabledButtonText: {
    color: COLORS.TEXT_TERTIARY,
  },
  button: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  buttonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: "600",
  },
  resultContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  resultHeader: {
    alignItems: "center",
    marginBottom: 30,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 20,
  },
  scoreContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  scoreText: {
    fontSize: 36,
    fontWeight: "bold",
  },
  resultStats: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  statLabel: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
  },
  resultActions: {
    gap: 12,
  },
})

export default ListeningDetailScreen
