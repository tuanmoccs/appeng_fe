import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { COLORS } from "../constants/colors"

interface TestQuestionProps {
  question: string
  options: string[] | string
  selectedOption?: string
  onSelectOption: (option: string) => void
  questionNumber: number
  totalQuestions: number
}

const TestQuestion: React.FC<TestQuestionProps> = ({
  question,
  options,
  selectedOption,
  onSelectOption,
  questionNumber,
  totalQuestions,
}) => {
  let optionsArray: string[] = []

  if (typeof options === "string") {
    try {
      optionsArray = JSON.parse(options)
    } catch (error) {
      console.error("Failed to parse options:", error)
    }
  } else if (Array.isArray(options)) {
    optionsArray = options
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.questionNumber}>
          Câu {questionNumber}/{totalQuestions}
        </Text>
      </View>

      <Text style={styles.question}>{question}</Text>

      <View style={styles.optionsContainer}>
        {optionsArray.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.optionContainer, option === selectedOption ? styles.selectedOption : styles.option]}
            onPress={() => onSelectOption(option)}
          >
            <View style={styles.optionContent}>
              <View
                style={[
                  styles.radioButton,
                  option === selectedOption ? styles.radioButtonSelected : styles.radioButtonUnselected,
                ]}
              >
                {option === selectedOption && <View style={styles.radioButtonInner} />}
              </View>
              <Text style={[styles.optionText, option === selectedOption ? styles.selectedOptionText : null]}>
                {option}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.PRIMARY,
    textAlign: "center",
  },
  question: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 24,
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 12,
  },
  optionContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  option: {
    borderColor: COLORS.BORDER,
    backgroundColor: COLORS.WHITE,
  },
  selectedOption: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: COLORS.PRIMARY_LIGHT + "10",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonUnselected: {
    borderColor: COLORS.BORDER,
    backgroundColor: COLORS.WHITE,
  },
  radioButtonSelected: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: COLORS.WHITE,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.PRIMARY,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    flex: 1,
  },
  selectedOptionText: {
    fontSize: 16,
    color: COLORS.PRIMARY,
    fontWeight: "500",
  },
})

export default TestQuestion
