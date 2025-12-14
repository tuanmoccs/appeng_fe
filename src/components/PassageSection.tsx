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
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={true}
      nestedScrollEnabled
    >
      {/* Passage Content */}
      <View style={styles.passageContainer}>
        {passage.title && <Text style={styles.passageTitle}>{passage.title}</Text>}
        <Text style={styles.passageContent}>{passage.content}</Text>
      </View>

      {/* Question Navigation */}
      <View style={styles.questionNav}>
        <Text style={styles.questionNavTitle}>Câu hỏi cho bài đọc này:</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.questionNavScroll}
          nestedScrollEnabled
        >
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

        {/* <View style={styles.difficultyBadge}>
          <Text style={styles.difficultyText}>
            Độ khó: {currentQuestion.difficulty === "easy" ? "Dễ" : currentQuestion.difficulty === "medium" ? "TB" : "Khó"}
          </Text>
        </View> */}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20, // Thêm padding để scroll thoải mái
  },
  
  passageContainer: {
    padding: 16,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  
  passageTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: COLORS.TEXT,
  },
  
  passageContent: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.TEXT,
  },
  
  questionNav: {
    padding: 16,
    backgroundColor: COLORS.BACKGROUND,
  },
  
  questionNavTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: COLORS.TEXT_SECONDARY,
  },
  
  questionNavScroll: {
    flexGrow: 0,
  },
  
  questionNavButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.WHITE,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  
  questionNavButtonActive: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  
  questionNavButtonAnswered: {
    backgroundColor: COLORS.SUCCESS + "20",
    borderColor: COLORS.SUCCESS,
  },
  
  questionNavButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.TEXT,
  },
  
  questionNavButtonTextActive: {
    color: COLORS.WHITE,
  },
  
  questionContainer: {
    padding: 16,
    backgroundColor: COLORS.WHITE,
  },
  
  questionText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    color: COLORS.TEXT,
    lineHeight: 24,
  },
  
  optionsContainer: {
    gap: 12,
  },
  
  optionButton: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 8,
  },
  
  optionButtonSelected: {
    backgroundColor: COLORS.PRIMARY + "10",
    borderColor: COLORS.PRIMARY,
  },
  
  optionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.BORDER,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  
  optionRadioSelected: {
    borderColor: COLORS.PRIMARY,
  },
  
  optionRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.PRIMARY,
  },
  
  optionText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.TEXT,
    lineHeight: 22,
  },
  
  optionTextSelected: {
    color: COLORS.PRIMARY,
    fontWeight: "500",
  },
  
  difficultyBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 12,
    marginTop: 16,
  },
  
  difficultyText: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
})

export default PassageSection