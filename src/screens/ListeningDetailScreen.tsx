import { useEffect, useState, useRef } from "react"
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  BackHandler,
  ScrollView,
  StyleSheet,
} from "react-native"
import AudioRecorderPlayer from 'react-native-audio-recorder-player'
import { COLORS } from "../constants/colors"
import ListeningQuestion from "../components/ListeningQuestion"
import { getListeningTestById, submitListeningTest } from "../services/listeningtestService"
import type { ListeningTest, ListeningAnswer, ListeningResult } from "../types/listeningtest"
import { styles } from "../styles/ListeningDetailScreen.styles"
const ListeningDetailScreen = ({ route, navigation }: any) => {
  const { testId } = route.params

  const [test, setTest] = useState<ListeningTest | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({})
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [testResult, setTestResult] = useState<ListeningResult | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [audioLoading, setAudioLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [startTime] = useState(Date.now())

  // Audio player instance
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer()).current

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBackPress)

    return () => {
      backHandler.remove()
      cleanup()
    }
  }, [])

  useEffect(() => {
    fetchTest()
  }, [])

  useEffect(() => {
    // Setup timer if test has time limit
    if (test?.time_limit && timeRemaining === null && !showResult) {
      setTimeRemaining(test.time_limit * 60)
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
  }, [currentSectionIndex, test])

  const cleanup = async () => {
    try {
      await audioRecorderPlayer.stopPlayer()
      audioRecorderPlayer.removePlayBackListener()
      console.log('🧹 Audio player cleaned up')
    } catch (error) {
      console.error('Error cleaning up audio player:', error)
    }
  }

  const fetchTest = async () => {
    try {
      setLoading(true)
      const testData = await getListeningTestById(testId)

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
      setAudioLoading(true)
      setIsPlaying(false)
      setCurrentTime(0)
      setDuration(0)

      const currentSection = test?.sections[currentSectionIndex]
      if (!currentSection?.audio_url) {
        console.log("No audio URL for current section")
        setAudioLoading(false)
        return
      }

      console.log("🎵 Loading audio from URL:", currentSection.audio_url)

      // Validate URL format
      if (!currentSection.audio_url.startsWith('http://') && !currentSection.audio_url.startsWith('https://')) {
        console.error("Invalid audio URL format:", currentSection.audio_url)
        Alert.alert("Lỗi Audio", "URL audio không hợp lệ")
        setAudioLoading(false)
        return
      }

      // Stop current playback
      await audioRecorderPlayer.stopPlayer()
      audioRecorderPlayer.removePlayBackListener()

      // Set up playback listener
      audioRecorderPlayer.addPlayBackListener((e) => {
        setCurrentTime(e.currentPosition)
        setDuration(e.duration)
        
        // Check if playback finished
        if (e.currentPosition >= e.duration && e.duration > 0) {
          setIsPlaying(false)
        }
      })

      console.log("✅ Audio loaded successfully")
      setAudioLoading(false)
    } catch (error: any) {
      console.error("❌ Error loading audio:", error)
      setAudioLoading(false)

      let errorMessage = "Không thể tải file âm thanh"
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = "Lỗi kết nối mạng. Kiểm tra internet và thử lại."
      } else if (error.message?.includes('format') || error.message?.includes('codec')) {
        errorMessage = "Format file âm thanh không được hỗ trợ"
      }

      Alert.alert("Lỗi Audio", errorMessage)
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
    try {
      const currentSection = test?.sections[currentSectionIndex]
      if (!currentSection?.audio_url) {
        Alert.alert("Lỗi", "Không có file audio cho section này")
        return
      }

      if (isPlaying) {
        await audioRecorderPlayer.pausePlayer()
        setIsPlaying(false)
        console.log("⏸️ Audio paused")
      } else {
        await audioRecorderPlayer.startPlayer(currentSection.audio_url)
        setIsPlaying(true)
        console.log("▶️ Audio playing")
      }
    } catch (error) {
      console.error("Error playing/pausing audio:", error)
      Alert.alert("Lỗi", "Có lỗi xảy ra khi phát audio")
    }
  }

  const handleSeekAudio = async (positionMs: number) => {
    try {
      await audioRecorderPlayer.seekToPlayer(positionMs)
      console.log(`🎯 Seeked to ${positionMs}ms`)
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

  const handlePreviousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1)
    }
  }

  const handleNextSection = () => {
    if (currentSectionIndex < (test?.sections.length || 0) - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1)
    }
  }

  const handleSubmitTest = async () => {
    if (!test?.sections) return

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
      await audioRecorderPlayer.stopPlayer()
      setIsPlaying(false)

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

  const getTotalAnsweredInSection = (sectionIndex: number) => {
    const section = test?.sections[sectionIndex]
    if (!section) return 0

    return section.questions.filter(q => userAnswers[q.id]).length
  }

  const isLastSection = () => {
    return currentSectionIndex === (test?.sections.length || 0) - 1
  }

  const isFirstSection = () => {
    return currentSectionIndex === 0
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

  if (!currentSection) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Đang tải section...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
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
          Section {currentSectionIndex + 1}/{test.sections.length}: {currentSection.title}
        </Text>
        {currentSection.instructions && <Text style={styles.sectionInstructions}>{currentSection.instructions}</Text>}

        <Text style={styles.sectionProgress}>
          Đã trả lời: {getTotalAnsweredInSection(currentSectionIndex)}/{currentSection.questions.length} câu
        </Text>
      </View>

      {/* Audio Player */}
      <View style={styles.audioContainer}>
        {audioLoading ? (
          <View style={styles.audioLoading}>
            <ActivityIndicator size="small" color={COLORS.PRIMARY} />
            <Text style={styles.audioLoadingText}>Đang tải audio...</Text>
          </View>
        ) : currentSection.audio_url ? (
          <View style={styles.audioControls}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={handlePlayPause}
            >
              <Text style={styles.playButtonText}>
                {isPlaying ? "⏸️" : "▶️"}
              </Text>
            </TouchableOpacity>

            <View style={styles.audioInfo}>
              <Text style={styles.audioTime}>
                {formatAudioTime(currentTime)} / {formatAudioTime(duration)}
              </Text>
              <TouchableOpacity
                style={styles.progressBar}
                onPress={(e) => {
                  if (!duration) return
                  const { locationX } = e.nativeEvent
                  const progressBarWidth = 200 // Approximate width
                  const newPosition = (locationX / progressBarWidth) * duration
                  handleSeekAudio(newPosition)
                }}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`
                    },
                  ]}
                />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text style={styles.noAudioText}>Section này không có audio</Text>
        )}
      </View>

      {/* All Questions in Current Section */}
      <View style={styles.questionsContainer}>
        {currentSection.questions.map((question, questionIndex) => (
          <View key={question.id} style={styles.questionWrapper}>
            <ListeningQuestion
              question={question.question}
              options={question.options}
              selectedOption={userAnswers[question.id]}
              onSelectOption={(answer) => handleSelectAnswer(question.id, answer)}
              questionNumber={questionIndex + 1}
              totalQuestions={currentSection.questions.length}
            />
          </View>
        ))}
      </View>

      {/* Section Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, styles.prevButton, isFirstSection() && styles.disabledButton]}
          onPress={handlePreviousSection}
          disabled={isFirstSection()}
        >
          <Text style={[styles.navButtonText, isFirstSection() && styles.disabledButtonText]}>← Section trước</Text>
        </TouchableOpacity>

        {isLastSection() ? (
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
          <TouchableOpacity style={[styles.navButton, styles.nextButton]} onPress={handleNextSection}>
            <Text style={styles.navButtonText}>Section sau →</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  )
}

export default ListeningDetailScreen