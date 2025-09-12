"use client"

import { useEffect, useState } from "react"
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  BackHandler,
  ScrollView,
} from "react-native"
import { COLORS } from "../constants/colors"
import TestQuestion from "../components/TestQuestion"
import { getTestById, submitTest } from "../services/testService"
import type { Test, TestAnswer, TestResult } from "../types/test"
import { styles } from "../styles/TestDetailScreem.styles"
import ChatBot from "../components/ChatBot"

const TestDetailScreen = ({ route, navigation }: any) => {
  const { testId } = route.params // Nhận ID test từ màn hình trước

  const [test, setTest] = useState<Test | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({})
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [showChatBot, setShowChatBot] = useState(false)

  useEffect(() => {
    fetchTest()
    const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBackPress)
    return () => backHandler.remove()
  }, [])

  useEffect(() => {
    if (test?.time_limit && timeRemaining === null && !showResult) {
      setTimeRemaining(test.time_limit * 60) 
    }
  }, [test])

  useEffect(() => {
    // Đếm ngược
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

  const fetchTest = async () => {
    try {
      setLoading(true)
      const testData = await getTestById(testId)

      if (!testData || !testData.questions || testData.questions.length === 0) {
        throw new Error("Test không có câu hỏi hoặc dữ liệu không hợp lệ")
      }

      console.log("✅ Test loaded successfully:", {
        id: testData.id,
        title: testData.title,
        questionsCount: testData.questions.length,
      })

      setTest(testData)
    } catch (error: any) {
      console.error("❌ Error loading test:", error)
      Alert.alert("Lỗi", error.message || "Không thể tải test")
      navigation.goBack()
    } finally {
      setLoading(false)
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

  const handleSelectAnswer = (questionId: number, answer: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleNextQuestion = () => {
    if (test?.questions && currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handleSubmitTest = async () => {
    if (!test?.questions) return

    // Kiểm tra xem tất cả các câu hỏi đã được trả lời chưa
    const unansweredQuestions = test.questions.filter((q) => !userAnswers[q.id])

    if (unansweredQuestions.length > 0) {
      Alert.alert("Vui lòng trả lời tất cả câu hỏi trước khi nộp bài.", `Bạn còn ${unansweredQuestions.length} câu chưa trả lời.`, [
        { text: "Ok", style: "cancel" },
      ])
    } else {
      Alert.alert("Nộp bài", "Bạn có chắc chắn muốn nộp bài?", [
        { text: "Hủy", style: "cancel" },
        { text: "Nộp bài", onPress: submitAnswers },
      ])
    }
  }

  const submitAnswers = async () => {
    if (!test?.questions) return

    try {
      setIsSubmitting(true)

      // Chuyển đổi đáp án thành format server yêu cầu
      const answers: TestAnswer[] = test.questions.map((question) => ({
        question_id: question.id,
        selected_answer: userAnswers[question.id] || "",
      }))

      const result = await submitTest(testId, answers)
      setTestResult(result)
      setShowResult(true)
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Không thể nộp bài test")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getProgressPercentage = () => {
    if (!test?.questions) return 0
    return (Object.keys(userAnswers).length / test.questions.length) * 100
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Đang tải test...</Text>
      </View>
    )
  }

  if (!test || !test.questions) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Không tìm thấy test</Text>
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
          <Text style={styles.resultTitle}>Kết quả test</Text>
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

  const currentQuestion = test.questions?.[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === test.questions.length - 1
  const isFirstQuestion = currentQuestionIndex === 0

  // Add safety check for currentQuestion
  if (!currentQuestion) {
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
            <Text
              style={[
                styles.timer,
                timeRemaining < 300 ? styles.timerWarning : null, // Warning when < 5 minutes
              ]}
            >
              ⏱️ {formatTime(timeRemaining)}
            </Text>
          )}
        </View>
        <TouchableOpacity style={styles.chatBotButton} onPress={() => setShowChatBot(true)}>
          <Text style={styles.chatBotButtonText}>🤖</Text>
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${((currentQuestionIndex + 1) / test.questions.length) * 100}%` }]}
          />
        </View>
        <Text style={styles.progressText}>
          Câu {currentQuestionIndex + 1} / {test.questions.length} • {Object.keys(userAnswers).length} đã trả lời
        </Text>
      </View>
      <ChatBot
      testData={test}
      currentQuestionId={currentQuestion?.id}
      isVisible={showChatBot}
      onClose={() => setShowChatBot(false)}
      /> 
      {/* Question */}
      <View style={styles.questionContainer}>
        <TestQuestion
          question={currentQuestion.question}
          options={currentQuestion.options}
          selectedOption={userAnswers[currentQuestion.id]}
          onSelectOption={(answer) => handleSelectAnswer(currentQuestion.id, answer)}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={test.questions.length}
        />
      </View>

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, styles.prevButton, isFirstQuestion && styles.disabledButton]}
          onPress={handlePreviousQuestion}
          disabled={isFirstQuestion}
        >
          <Text style={[styles.navButtonText, isFirstQuestion && styles.disabledButtonText]}>← Câu trước</Text>
        </TouchableOpacity>

        {isLastQuestion ? (
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
export default TestDetailScreen