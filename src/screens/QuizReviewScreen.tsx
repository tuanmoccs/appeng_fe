// src/screens/QuizReviewScreen.tsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';
import Button from '../components/Button';
import type { Quiz, QuizResult, UserAnswers } from '../types/quiz';
import { styles } from '../styles/QuizReviewScreen.styles'

interface QuizReviewScreenProps {
  route: {
    params: {
      quiz: Quiz;
      result: QuizResult;
      userAnswers: UserAnswers;
    };
  };
  navigation: any;
}

const QuizReviewScreen = ({ route, navigation }: QuizReviewScreenProps) => {
  const { quiz, result, userAnswers } = route.params;

  const handleRetry = () => {
    navigation.navigate('QuizDetail', { quizId: quiz.id });
  };

  const handleBackToQuizzes = () => {
    navigation.navigate('Quizzes');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* HEADER KẾT QUẢ */}
      <View style={styles.resultHeader}>
        <Text style={styles.resultTitle}>Quiz Results</Text>
        
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Your Score</Text>
          <Text style={styles.scoreValue}>
            {result.score}/{result.total_questions}
          </Text>
          <Text style={styles.percentageValue}>
            {result.percentage.toFixed(0)}%
          </Text>
        </View>

        <View style={[
          styles.statusBadge,
          result.passed ? styles.passedBadge : styles.failedBadge
        ]}>
          <Text style={styles.statusText}>
            {result.passed ? '✓ PASSED' : '✗ FAILED'}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{result.correct_answers.length}</Text>
            <Text style={styles.statLabel}>Correct</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{result.incorrect_answers.length}</Text>
            <Text style={styles.statLabel}>Incorrect</Text>
          </View>
        </View>
      </View>

      {/* DANH SÁCH CÂU HỎI */}
      <View style={styles.questionsSection}>
        <Text style={styles.sectionTitle}>Questions Review</Text>
        
        {Array.isArray(quiz.questions) &&
          quiz.questions.map((question, index) => {
          const isCorrect = result.correct_answers.includes(question.id);
          const userAnswer = userAnswers[question.id];
          const incorrectItem = result.incorrect_answers.find(
            item => item.question_id === question.id
          );
          const correctAnswer = incorrectItem?.correct_answer || userAnswer;
          
          return (
            <View 
              key={question.id?? index} 
              style={[
                styles.questionCard,
                isCorrect ? styles.correctCard : styles.incorrectCard
              ]}
            >
              {/* ICON VÀ SỐ THỨ TỰ */}
              <View style={styles.questionHeader}>
                <View style={styles.questionNumber}>
                  <Text style={styles.questionNumberText}>Q{index + 1}</Text>
                </View>
                <Text style={styles.questionStatus}>
                  {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                </Text>
              </View>

              {/* CÂU HỎI */}
              <Text style={styles.questionText}>{question.question}</Text>

              {/* CÁC LỰA CHỌN */}
              <View style={styles.optionsContainer}>
                {Array.isArray(question.options) &&
                question.options.map((option, idx) => {
                  const isUserAnswer = option === userAnswer;
                  const isCorrectAnswer = option === correctAnswer;
                  
                  let optionStyle = styles.optionDefault;
                  let optionTextStyle = styles.optionTextDefault;
                  
                  if (isCorrectAnswer) {
                    optionStyle = styles.optionCorrect;
                    optionTextStyle = styles.optionTextCorrect;
                  } else if (isUserAnswer && !isCorrect) {
                    optionStyle = styles.optionIncorrect;
                    optionTextStyle = styles.optionTextIncorrect;
                  }

                  return (
                    <View key={idx} style={[styles.option, optionStyle]}>
                      <Text style={optionTextStyle}>
                        {String.fromCharCode(65 + idx)}. {option}
                        {isCorrectAnswer && ' ✓'}
                        {isUserAnswer && !isCorrect && ' ✗'}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* THÔNG TIN TRẢ LỜI */}
              <View style={styles.answerInfo}>
                <Text style={styles.answerInfoText}>
                  Your answer: <Text style={isCorrect ? styles.correctText : styles.incorrectText}>
                    {userAnswer || 'Not answered'}
                  </Text>
                </Text>
                {!isCorrect && (
                  <Text style={styles.answerInfoText}>
                    Correct answer: <Text style={styles.correctText}>{correctAnswer}</Text>
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* BUTTONS */}
      <View style={styles.buttonContainer}>
        <Button 
          title="Try Again" 
          onPress={handleRetry} 
          type="primary" 
          style={styles.button} 
        />
        <Button 
          title="Back to Quizzes" 
          onPress={handleBackToQuizzes} 
          type="outline" 
          style={styles.button} 
        />
      </View>
    </ScrollView>
  );
};

export default QuizReviewScreen;