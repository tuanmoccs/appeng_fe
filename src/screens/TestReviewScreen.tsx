"use client"

import { useState } from "react"
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native"
import { useRoute, useNavigation, type RouteProp, type NavigationProp } from "@react-navigation/native"
import type { DetailedQuestionResult } from "../types/test"
import { COLORS } from "../constants/colors"

type ReviewRouteProp = RouteProp<{ TestReview: { testResult: any; testTitle: string } }, "TestReview">

export default function TestReviewScreen() {
  const route = useRoute<ReviewRouteProp>()
  const navigation = useNavigation<NavigationProp<any>>()
  const { testResult, testTitle } = route.params

  const [filter, setFilter] = useState<"all" | "correct" | "incorrect">("all")

  const filteredResults = testResult.detailed_results.filter((result: DetailedQuestionResult) => {
    if (filter === "correct") return result.is_correct
    if (filter === "incorrect") return !result.is_correct
    return true
  })

  const renderQuestion = (result: DetailedQuestionResult, index: number) => {
    const isCorrect = result.is_correct

    return (
      <View key={result.question_id} style={styles.questionCard}>
        {/* Question Header */}
        <View style={styles.questionHeader}>
          <Text style={styles.questionNumber}>Câu {index + 1}</Text>
          <View
            style={[styles.resultBadge, { backgroundColor: isCorrect ? COLORS.SUCCESS + "20" : COLORS.ERROR + "20" }]}
          >
            <Text style={[styles.resultBadgeText, { color: isCorrect ? COLORS.SUCCESS : COLORS.ERROR }]}>
              {isCorrect ? "✓ Đúng" : "✗ Sai"}
            </Text>
          </View>
        </View>

        {/* Question Text */}
        <Text style={styles.questionText}>{result.question}</Text>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {result.options.map((option, idx) => {
            const optionLabel = String.fromCharCode(65 + idx)
            const isUserAnswer = result.user_answer === optionLabel
            const isCorrectAnswer = result.correct_answer === optionLabel

            const optionStyle = [
              styles.option,
              isCorrectAnswer && styles.correctOption,
              isUserAnswer && !isCorrect && styles.incorrectOption,
            ]

            const optionTextStyle = [
              styles.optionText,
              isCorrectAnswer && styles.correctOptionText,
              isUserAnswer && !isCorrect && styles.incorrectOptionText,
            ]


            return (
              <View key={idx} style={[styles.option, optionStyle]}>
                <View style={styles.optionLabelContainer}>
                  <Text style={[styles.optionLabel, optionTextStyle]}>{optionLabel}</Text>
                </View>
                <Text style={[styles.optionContent, optionTextStyle]}>{option}</Text>
                {isCorrectAnswer && <Text style={styles.correctIcon}>✓</Text>}
                {isUserAnswer && !isCorrect && <Text style={styles.incorrectIcon}>✗</Text>}
              </View>
            )
          })}
        </View>

        {/* Answer Info */}
        {isCorrect && (
          <View style={styles.answerInfo}>
            <Text style={styles.answerInfoLabel}>Đáp án của bạn: </Text>
            <Text style={styles.correctAnswerText}>{result.user_answer}</Text>
            <Text style={styles.answerInfoLabel}> • Đáp án đúng: </Text>
            <Text style={styles.correctAnswerText}>{result.correct_answer}</Text>
          </View>
        )}
        {!isCorrect && (
          <View style={styles.answerInfo}>
            <Text style={styles.answerInfoLabel}>Đáp án của bạn: </Text>
            <Text style={styles.userAnswerText}>{result.user_answer}</Text>
            <Text style={styles.answerInfoLabel}> • Đáp án đúng: </Text>
            <Text style={styles.correctAnswerText}>{result.correct_answer}</Text>
          </View>
        )}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Xem lại đáp án</Text>
        <Text style={styles.headerSubtitle}>{testTitle}</Text>
      </View>

      {/* Score Summary */}
      <View style={styles.scoreSummary}>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreValue}>{testResult.score.toFixed(0)}%</Text>
          <Text style={styles.scoreLabel}>Điểm</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={[styles.scoreValue, { color: COLORS.SUCCESS }]}>{testResult.correct_answers}</Text>
          <Text style={styles.scoreLabel}>Đúng</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={[styles.scoreValue, { color: COLORS.ERROR }]}>
            {testResult.total_questions - testResult.correct_answers}
          </Text>
          <Text style={styles.scoreLabel}>Sai</Text>
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === "all" && styles.filterButtonActive]}
          onPress={() => setFilter("all")}
        >
          <Text style={[styles.filterButtonText, filter === "all" && styles.filterButtonTextActive]}>
            Tất cả ({testResult.detailed_results.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === "correct" && styles.filterButtonActive]}
          onPress={() => setFilter("correct")}
        >
          <Text style={[styles.filterButtonText, filter === "correct" && styles.filterButtonTextActive]}>
            Đúng ({testResult.correct_answers})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === "incorrect" && styles.filterButtonActive]}
          onPress={() => setFilter("incorrect")}
        >
          <Text style={[styles.filterButtonText, filter === "incorrect" && styles.filterButtonTextActive]}>
            Sai ({testResult.total_questions - testResult.correct_answers})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Questions List */}
      <ScrollView style={styles.questionsContainer} contentContainerStyle={styles.questionsContent}>
        {filteredResults.map((result: DetailedQuestionResult, index: number) => renderQuestion(result, index))}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: COLORS.PRIMARY,
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
  },
  scoreSummary: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  scoreItem: {
    flex: 1,
    alignItems: "center",
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.PRIMARY,
    marginBottom: 4,
  },
  scoreLabel: {
    fontSize: 14,
    color: "#6c757d",
  },
  filterContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6c757d",
  },
  filterButtonTextActive: {
    color: "#fff",
  },
  questionsContainer: {
    flex: 1,
  },
  questionsContent: {
    padding: 16,
  },
  questionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.PRIMARY,
  },
  resultBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resultBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  questionText: {
    fontSize: 16,
    color: "#212529",
    marginBottom: 16,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 8,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  correctOption: {
    backgroundColor: COLORS.SUCCESS + "15",
    borderColor: COLORS.SUCCESS,
  },
  incorrectOption: {
    backgroundColor: COLORS.ERROR + "15",
    borderColor: COLORS.ERROR,
  },
  optionLabelContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#495057",
  },
  optionContent: {
    flex: 1,
    fontSize: 15,
    color: "#212529",
  },
  optionText: {
    color: "#495057",
  },
  correctOptionText: {
    color: COLORS.SUCCESS,
    fontWeight: "500",
  },
  incorrectOptionText: {
    color: COLORS.ERROR,
    fontWeight: "500",
  },
  correctIcon: {
    fontSize: 18,
    color: COLORS.SUCCESS,
    fontWeight: "bold",
    marginLeft: 8,
  },
  incorrectIcon: {
    fontSize: 18,
    color: COLORS.ERROR,
    fontWeight: "bold",
    marginLeft: 8,
  },
  answerInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  answerInfoLabel: {
    fontSize: 14,
    color: "#6c757d",
  },
  userAnswerText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.ERROR,
  },
  correctAnswerText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.SUCCESS,
  },
  footer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  backButton: {
    backgroundColor: COLORS.PRIMARY,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
})
