// src/screens/LessonQuizScreen.tsx
import { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Image,
} from 'react-native'
import { getLessonQuiz, submitLessonQuiz } from '../services/LessonService'
import type { Quiz, QuizQuestion, QuizResult } from '../types/lesson'
import { COLORS } from '../constants/colors'

const LessonQuizScreen = ({ route, navigation }: any) => {
  const { lessonId } = route.params

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({})
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<QuizResult | null>(null)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    fetchQuiz()
  }, [])

  useEffect(() => {
    if (quiz && timeRemaining > 0 && !result) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleTimeUp()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [timeRemaining, quiz, result])

  const fetchQuiz = async () => {
    try {
      setLoading(true)
      const quizData = await getLessonQuiz(lessonId)
      setQuiz(quizData)
      setTimeRemaining(quizData.time_limit * 60)
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể tải quiz')
      navigation.goBack()
    } finally {
      setLoading(false)
    }
  }

  const handleTimeUp = () => {
    Alert.alert('Hết giờ', 'Thời gian làm bài đã hết. Bài làm sẽ được nộp tự động.', [
      { text: 'OK', onPress: handleSubmit },
    ])
  }

  const handleSelectAnswer = (questionId: number, answer: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const handleNext = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmit = async () => {
    if (!quiz) return

    const unansweredCount = quiz.questions.filter((q) => !userAnswers[q.id]).length

    if (unansweredCount > 0) {
      Alert.alert('Chưa hoàn thành', `Bạn còn ${unansweredCount} câu chưa trả lời. Nộp bài?`, [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Nộp bài', onPress: submitQuiz },
      ])
    } else {
      Alert.alert('Nộp bài', 'Bạn có chắc muốn nộp bài?', [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Nộp bài', onPress: submitQuiz },
      ])
    }
  }

  const submitQuiz = async () => {
    if (!quiz) return

    try {
      setIsSubmitting(true)
      const timeTaken = Math.floor((Date.now() - startTime) / 1000)
      const quizResult = await submitLessonQuiz(lessonId, userAnswers, timeTaken)
      setResult(quizResult)
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể nộp bài')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const renderQuestion = (question: QuizQuestion) => {
    const userAnswer = userAnswers[question.id]

    if (question.type === 'multiple_choice') {
      return (
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{question.question}</Text>
          {question.image_url && (
            <Image source={{ uri: question.image_url }} style={styles.questionImage} resizeMode="contain" />
          )}
          <View style={styles.optionsContainer}>
            {question.options?.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.optionButton, userAnswer === option && styles.selectedOption]}
                onPress={() => handleSelectAnswer(question.id, option)}
              >
                <Text style={[styles.optionText, userAnswer === option && styles.selectedOptionText]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )
    }

    if (question.type === 'true_false') {
      return (
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{question.question}</Text>
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[styles.optionButton, userAnswer === 'true' && styles.selectedOption]}
              onPress={() => handleSelectAnswer(question.id, 'true')}
            >
              <Text style={[styles.optionText, userAnswer === 'true' && styles.selectedOptionText]}>Đúng</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, userAnswer === 'false' && styles.selectedOption]}
              onPress={() => handleSelectAnswer(question.id, 'false')}
            >
              <Text style={[styles.optionText, userAnswer === 'false' && styles.selectedOptionText]}>Sai</Text>
            </TouchableOpacity>
          </View>
        </View>
      )
    }

    return (
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{question.question}</Text>
        <Text style={styles.fillBlankHint}>Nhập câu trả lời bên dưới</Text>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Đang tải quiz...</Text>
      </View>
    )
  }

  if (!quiz) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Không tìm thấy quiz</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (result) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.resultContainer}>
        <View style={styles.resultHeader}>
          <Text style={styles.resultTitle}>Kết quả Quiz</Text>
          <View
            style={[styles.scoreContainer, { backgroundColor: result.is_passed ? COLORS.SUCCESS + '20' : COLORS.ERROR + '20' }]}
          >
            <Text style={[styles.scoreText, { color: result.is_passed ? COLORS.SUCCESS : COLORS.ERROR }]}>
              {result.score.toFixed(0)}%
            </Text>
          </View>
        </View>

        <View style={styles.resultStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Điểm số</Text>
            <Text style={styles.statValue}>{result.score.toFixed(1)}%</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Câu đúng</Text>
            <Text style={styles.statValue}>
              {result.correct_answers}/{result.total_questions}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Kết quả</Text>
            <Text style={[styles.statValue, { color: result.is_passed ? COLORS.SUCCESS : COLORS.ERROR }]}>
              {result.is_passed ? 'ĐẠT' : 'CHƯA ĐẠT'}
            </Text>
          </View>
        </View>

        {result.is_passed ? (
          <View style={styles.passedMessage}>
            <Text style={styles.passedText}>🎉 Chúc mừng! Bạn đã hoàn thành bài học này!</Text>
            <Text style={styles.passedSubtext}>Bài học tiếp theo đã được mở khóa</Text>
          </View>
        ) : (
          <View style={styles.failedMessage}>
            <Text style={styles.failedText}>Bạn cần đạt {quiz.passing_score}% để qua bài</Text>
            <Text style={styles.failedSubtext}>Hãy xem lại bài học và thử lại nhé!</Text>
          </View>
        )}

        <View style={styles.resultActions}>
          <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>Quay lại</Text>
          </TouchableOpacity>
          {!result.is_passed && (
            <TouchableOpacity style={[styles.button, styles.retryButton]} onPress={() => navigation.replace('LessonQuiz', { lessonId })}>
              <Text style={styles.buttonText}>Thử lại</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    )
  }

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const answeredCount = Object.keys(userAnswers).length

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Thoát</Text>
          </TouchableOpacity>
          <Text style={[styles.timer, timeRemaining < 300 && styles.timerWarning]}>⏱️ {formatTime(timeRemaining)}</Text>
        </View>
        <Text style={styles.quizTitle}>{quiz.title}</Text>
        <Text style={styles.quizProgress}>
          Câu {currentQuestionIndex + 1}/{quiz.total_questions} • Đã trả lời: {answeredCount}/{quiz.total_questions}
        </Text>
      </View>

      {/* Question */}
      <ScrollView style={styles.content}>{renderQuestion(currentQuestion)}</ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={[styles.navButton, currentQuestionIndex === 0 && styles.disabledButton]}
          onPress={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <Text style={styles.navButtonText}>← Trước</Text>
        </TouchableOpacity>

        {currentQuestionIndex === quiz.questions.length - 1 ? (
          <TouchableOpacity style={[styles.navButton, styles.submitButton]} onPress={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator size="small" color={COLORS.WHITE} />
            ) : (
              <Text style={styles.navButtonText}>Nộp bài</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.navButton} onPress={handleNext}>
            <Text style={styles.navButtonText}>Sau →</Text>
          </TouchableOpacity>
        )}
      </View>
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
  },
  header: {
    backgroundColor: COLORS.PRIMARY,
    padding: 15,
    paddingTop: 50,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  backText: {
    color: COLORS.WHITE,
    fontSize: 16,
  },
  timer: {
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: 'bold',
  },
  timerWarning: {
    color: COLORS.ERROR,
  },
  quizTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    marginBottom: 5,
  },
  quizProgress: {
    color: COLORS.WHITE,
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  questionContainer: {
    marginBottom: 20,
  },
  questionText: {
    fontSize: 18,
    color: COLORS.TEXT,
    marginBottom: 15,
    lineHeight: 26,
  },
  questionImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  optionsContainer: {
    marginTop: 10,
  },
  optionButton: {
    backgroundColor: COLORS.BACKGROUND,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: COLORS.BORDER,
  },
  selectedOption: {
    backgroundColor: COLORS.PRIMARY + '20',
    borderColor: COLORS.PRIMARY,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.TEXT,
  },
  selectedOptionText: {
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
  fillBlankHint: {
    fontSize: 14,
    color: COLORS.GRAY,
    fontStyle: 'italic',
  },
  navigation: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
  navButton: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  submitButton: {
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
  resultContainer: {
    padding: 20,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: 15,
  },
  scoreContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  resultStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.GRAY,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.TEXT,
  },
  passedMessage: {
    backgroundColor: COLORS.SUCCESS + '20',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  passedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.SUCCESS,
    marginBottom: 5,
  },
  passedSubtext: {
    fontSize: 14,
    color: COLORS.TEXT,
  },
  failedMessage: {
    backgroundColor: COLORS.ERROR + '20',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  failedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.ERROR,
    marginBottom: 5,
  },
  failedSubtext: {
    fontSize: 14,
    color: COLORS.TEXT,
  },
  resultActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  retryButton: {
    backgroundColor: COLORS.WARNING,
  },
  buttonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '600',
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
})

export default LessonQuizScreen