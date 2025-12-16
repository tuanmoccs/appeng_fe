"use client"

import { useEffect, useState } from "react"
import { View, Text, ActivityIndicator, TouchableOpacity, Alert, BackHandler, ScrollView } from "react-native"
import { COLORS } from "../constants/colors"
import TestQuestion from "../components/TestQuestion"
import PassageSection from "../components/PassageSection"
import ChatBot from "../components/ChatBot"
import { getTestById, submitTest } from "../services/testService"
import type { Test, TestAnswer, TestResult } from "../types/test"
import { styles } from "../styles/TestDetailScreem.styles"

const TestDetailScreen = ({ route, navigation }: any) => {
  const { testId } = route.params

  const [test, setTest] = useState<Test | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [currentPassageQuestionIndex, setCurrentPassageQuestionIndex] = useState(0)
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

      if (!testData || !testData.sections || testData.sections.length === 0) {
        throw new Error("Test không có nội dung hoặc dữ liệu không hợp lệ")
      }

      console.log("✅ Test loaded successfully:", {
        id: testData.id,
        title: testData.title,
        sectionsCount: testData.sections.length,
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

  const handlePreviousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1)
      setCurrentPassageQuestionIndex(0)
    }
  }

  const handleNextSection = () => {
    if (test?.sections && currentSectionIndex < test.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1)
      setCurrentPassageQuestionIndex(0)
    }
  }

  const getTotalQuestions = () => {
    if (!test?.sections) return 0
    return test.sections.reduce((total, section) => {
      if (section.type === "standalone") {
        return total + 1
      } else {
        return total + section.questions.length
      }
    }, 0)
  }

  const handleSubmitTest = async () => {
    const totalQuestions = getTotalQuestions()
    const answeredCount = Object.keys(userAnswers).length

    if (answeredCount < totalQuestions) {
      Alert.alert(
        "Chưa hoàn thành",
        `Bạn còn ${totalQuestions - answeredCount} câu chưa trả lời. Bạn có chắc muốn nộp bài?`,
        [
          { text: "Hủy", style: "cancel" },
          { text: "Nộp bài", onPress: submitAnswers },
        ],
      )
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

      const allQuestions: number[] = []
      test.sections.forEach((section) => {
        if (section.type === "standalone") {
          allQuestions.push(section.question.id)
        } else {
          section.questions.forEach((q) => allQuestions.push(q.id))
        }
      })

      const answers: TestAnswer[] = allQuestions.map((questionId) => ({
        question_id: questionId,
        selected_answer: userAnswers[questionId] || "",
      }))

      console.log("[v0] Submitting answers:", answers)

      const result = await submitTest(testId, answers)

      console.log("[v0] Received result:", result)

      setTestResult(result)
      setShowResult(true)
    } catch (error: any) {
      console.error("[v0] Submit error:", error)
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

  const getCurrentQuestionId = (): number | undefined => {
    if (!test) return undefined
    const currentSection = test.sections[currentSectionIndex]
    if (currentSection.type === "standalone") {
      return currentSection.question.id
    } else {
      return currentSection.questions[currentPassageQuestionIndex]?.id
    }
  }

  const handleViewReview = () => {
    if (testResult && test) {
      navigation.navigate("TestReview", {
        testResult,
        testTitle: test.title,
      })
    }
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Đang tải test...</Text>
      </View>
    )
  }

  if (!test || !test.sections) {
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
          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleViewReview}>
            <Text style={styles.buttonText}>Xem lại đáp án</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>Quay lại danh sách</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    )
  }

  const currentSection = test.sections[currentSectionIndex]
  const isLastSection = currentSectionIndex === test.sections.length - 1
  const isFirstSection = currentSectionIndex === 0

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

        <TouchableOpacity style={styles.chatBotButton} onPress={() => setShowChatBot(true)}>
          <Text style={styles.chatBotButtonText}>🤖</Text>
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${((currentSectionIndex + 1) / test.sections.length) * 100}%` }]}
          />
        </View>
        <Text style={styles.progressText}>
          Phần {currentSectionIndex + 1} / {test.sections.length} • {Object.keys(userAnswers).length} đã trả lời
        </Text>
      </View>

      {/* Content */}
      <View style={styles.passagesContainer}>
        {currentSection.type === "standalone" ? (
          <TestQuestion
            question={currentSection.question.question}
            options={currentSection.question.options}
            selectedOption={userAnswers[currentSection.question.id]}
            onSelectOption={(answer) => handleSelectAnswer(currentSection.question.id, answer)}
            questionNumber={currentSectionIndex + 1}
            totalQuestions={test.sections.length}
          />
        ) : (
          <PassageSection
            passage={currentSection.passage}
            questions={currentSection.questions}
            currentQuestionIndex={currentPassageQuestionIndex}
            onSelectQuestion={setCurrentPassageQuestionIndex}
            userAnswers={userAnswers}
            onSelectAnswer={handleSelectAnswer}
          />
        )}
      </View>

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, styles.prevButton, isFirstSection && styles.disabledButton]}
          onPress={handlePreviousSection}
          disabled={isFirstSection}
        >
          <Text style={[styles.navButtonText, isFirstSection && styles.disabledButtonText]}>← Trước</Text>
        </TouchableOpacity>

        {isLastSection ? (
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
            <Text style={styles.navButtonText}>Tiếp →</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ChatBot */}
      {test && (
        <ChatBot
          testData={test}
          currentQuestionId={getCurrentQuestionId()}
          isVisible={showChatBot}
          onClose={() => setShowChatBot(false)}
        />
      )}
    </View>
  )
}

export default TestDetailScreen
