// src/components/QuizQuestion.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';

interface QuizQuestionProps {
  question: string;
  options: string[] | string;
  selectedOption?: string;
  onSelectOption: (option: string) => void;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  options,
  selectedOption,
  onSelectOption,
}) => {
  let optionsArray: string[] = [];
  
  if (typeof options === 'string') {
    try {
      optionsArray = JSON.parse(options);
    } catch (error) {
      console.error('Failed to parse options:', error);
    }
  } else if (Array.isArray(options)) {
    optionsArray = options;
  }
  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question}</Text>

      <View style={styles.optionsContainer}>
        {optionsArray.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionContainer,
              option === selectedOption ? styles.selectedOption : styles.option,
            ]}
            onPress={() => onSelectOption(option)}
          >
            <Text
              style={[
                styles.optionText,
                option === selectedOption ? styles.selectedOptionText : null,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 12,
  },
  optionContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  option: {
    borderColor: COLORS.BORDER,
    backgroundColor: COLORS.WHITE,
  },
  selectedOption: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: COLORS.PRIMARY_LIGHT + '20', // 20% opacity
  },
  optionText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
  },
  selectedOptionText: {
    fontSize: 16,
    color: COLORS.PRIMARY,
    fontWeight: '500',
  },
});

export default QuizQuestion;