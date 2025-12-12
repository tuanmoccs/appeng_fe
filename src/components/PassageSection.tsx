// src/components/PassageSection.tsx

import React from "react"
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native"
import { COLORS } from "../constants/colors"
import type { TestPassage, TestQuestion } from "../types/test"

interface PassageSectionProps {
  passage: TestPassage
  questions: TestQuestion[]
  currentQuestionIndex: number
  onSelectQuestion: (index: number) => void
  userAnswers: Record<number, string>
  onSelectAnswer: (questionId: number, answer: string) => void
}

const PassageSection: React.FC<PassageSectionProps> = ({
  passage,
  questions,
  currentQuestionIndex,
  onSelectQuestion,
  userAnswers,
  onSelectAnswer,
}) => {
  const currentQuestion = questions[currentQuestionIndex]

  return (
    <View style={styles.container}>
      {/* Passage Content */}
      <View style={styles.passageContainer}>
        {passage.title && <Text style={styles.passageTitle}>{passage.title}</Text>}
        <ScrollView style={styles.passageScroll} nestedScrollEnabled>
          <Text style={styles.passageContent}>{passage.content}</Text>
        </ScrollView>
      </View>

      {/* Question Navigation */}
      <View style={styles.questionNav}>
        <Text style={styles.questionNavTitle}>Câu hỏi cho bài đọc này:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.questionNavScroll}>
          {questions.map((q, index) => (
            <TouchableOpacity
              key={q.id}
              style={[
                styles.questionNavButton,
                currentQuestionIndex === index && styles.questionNavButtonActive,
                userAnswers[q.id] && styles.questionNavButtonAnswered,
              ]}
              onPress={() => onSelectQuestion(index)}
            >
              <Text
                style={[
                  styles.questionNavButtonText,
                  currentQuestionIndex === index && styles.questionNavButtonTextActive,
                ]}
              >
                {index + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Current Question */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>
          Câu {currentQuestionIndex + 1}: {currentQuestion.question}
        </Text>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => {
            const isSelected = userAnswers[currentQuestion.id] === option
            return (
              <TouchableOpacity
                key={index}
                style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
                onPress={() => onSelectAnswer(currentQuestion.id, option)}
              >
                <View style={[styles.optionRadio, isSelected && styles.optionRadioSelected]}>
                  {isSelected && <View style={styles.optionRadioInner} />}
                </View>
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                  {String.fromCharCode(65 + index)}. {option}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <View style={styles.difficultyBadge}>
          <Text style={styles.difficultyText}>
            Độ khó: {currentQuestion.difficulty === "easy" ? "Dễ" : currentQuestion.difficulty === "medium" ? "TB" : "Khó"}
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  passageContainer: {
    backgroundColor: COLORS.LIGHT_GRAY,
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    maxHeight: 250,
  },
  passageTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 10,
  },
  passageScroll: {
    maxHeight: 200,
  },
  passageContent: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.TEXT_SECONDARY,
  },
  questionNav: {
    marginBottom: 15,
  },
  questionNavTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  questionNavScroll: {
    flexDirection: "row",
  },
  questionNavButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.WHITE,
    borderWidth: 2,
    borderColor: COLORS.BORDER,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  questionNavButtonActive: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: COLORS.PRIMARY + "20",
  },
  questionNavButtonAnswered: {
    backgroundColor: COLORS.SUCCESS + "20",
    borderColor: COLORS.SUCCESS,
  },
  questionNavButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.TEXT_SECONDARY,
  },
  questionNavButtonTextActive: {
    color: COLORS.PRIMARY,
  },
  questionContainer: {
    flex: 1,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 20,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.BORDER,
  },
  optionButtonSelected: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: COLORS.PRIMARY + "10",
  },
  optionRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.BORDER,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  optionRadioSelected: {
    borderColor: COLORS.PRIMARY,
  },
  optionRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.PRIMARY,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 22,
  },
  optionTextSelected: {
    color: COLORS.PRIMARY,
    fontWeight: "600",
  },
  difficultyBadge: {
    alignSelf: "flex-start",
    marginTop: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.INFO + "20",
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    color: COLORS.INFO,
    fontWeight: "600",
  },
})

export default PassageSection