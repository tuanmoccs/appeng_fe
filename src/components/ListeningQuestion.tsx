import type React from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { COLORS } from "../constants/colors"

interface ListeningQuestionProps {
  question: string
  options: string[]
  selectedOption?: string
  onSelectOption: (option: string) => void
  questionNumber: number
  totalQuestions: number
}

const ListeningQuestion: React.FC<ListeningQuestionProps> = ({
  question,
  options,
  selectedOption,
  onSelectOption,
  questionNumber,
  totalQuestions,
}) => {
  const getOptionLabel = (index: number) => {
    return String.fromCharCode(65 + index) // A, B, C, D...
  }

  return (
    <View style={styles.container}>
      <View style={styles.questionHeader}>
        <Text style={styles.questionNumber}>
          Câu {questionNumber}/{totalQuestions}
        </Text>
      </View>

      <Text style={styles.questionText}>{question}</Text>

      <View style={styles.optionsContainer}>
        {options.map((option, index) => {
          const optionLabel = getOptionLabel(index)
          const isSelected = selectedOption === option

          return (
            <TouchableOpacity
              key={index}
              style={[styles.optionButton, isSelected && styles.selectedOption]}
              onPress={() => onSelectOption(option)}
              activeOpacity={0.7}
            >
              <View style={[styles.optionIndicator, isSelected && styles.selectedIndicator]}>
                <Text style={[styles.optionLabel, isSelected && styles.selectedLabel]}>{optionLabel}</Text>
              </View>
              <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>{option}</Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  questionHeader: {
    marginBottom: 16,
  },
  questionNumber: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: "600",
  },
  questionText: {
    fontSize: 18,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: "600",
    lineHeight: 26,
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.WHITE,
    borderWidth: 2,
    borderColor: COLORS.BORDER,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedOption: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: COLORS.PRIMARY + "10",
  },
  optionIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.GRAY,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  selectedIndicator: {
    backgroundColor: COLORS.PRIMARY,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.WHITE,
  },
  selectedLabel: {
    color: COLORS.WHITE,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 22,
  },
  selectedOptionText: {
    color: COLORS.PRIMARY,
    fontWeight: "500",
  },
})

export default ListeningQuestion
