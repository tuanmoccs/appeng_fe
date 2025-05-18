// src/screens/QuizDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../constants/colors';
import Button from '../components/Button';
import QuizQuestion from '../components/QuizQuestion';
import { fetchQuizById, submitQuiz, setUserAnswer, clearUserAnswers, clearQuizResult } from '../store/slices/quizSlice';
import type { RootState, AppDispatch } from '../store/store';

const QuizDetailScreen = ({ route, navigation }: any) => {
  const { quizId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { currentQuiz, userAnswers, quizResult, isLoading, error } = useSelector((state: RootState) => state.quiz);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    dispatch(fetchQuizById(quizId));
    dispatch(clearUserAnswers());
    dispatch(clearQuizResult());
    
    return () => {
      dispatch(clearUserAnswers());
      dispatch(clearQuizResult());
    };
  }, [dispatch, quizId]);

  const handleSelectAnswer = (questionId: number, answer: string) => {
    dispatch(setUserAnswer({ questionId, answer }));
  };

  const handleSubmitQuiz = () => {
    dispatch(submitQuiz({ quizId, answers: userAnswers }))
      .unwrap()
      .then(() => {
        setShowResults(true);
      });
  };

  const handleRetry = () => {
    dispatch(clearUserAnswers());
    dispatch(clearQuizResult());
    setShowResults(false);
    dispatch(fetchQuizById(quizId));
  };

  const handleBackToQuizzes = () => {
    navigation.goBack();
  };

  if (isLoading && !quizResult) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Go Back" onPress={handleBackToQuizzes} type="primary" style={styles.button} />
      </View>
    );
  }

  if (!currentQuiz) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Quiz not found</Text>
        <Button title="Go Back" onPress={handleBackToQuizzes} type="primary" style={styles.button} />
      </View>
    );
  }

  if (showResults && quizResult) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.resultHeader}>
          <Text style={styles.resultTitle}>Quiz Results</Text>
          <Text style={styles.resultScore}>
            Score: {quizResult.score}/{quizResult.total_questions} ({quizResult.percentage.toFixed(0)}%)
          </Text>
          <Text style={[
            styles.resultStatus,
            quizResult.passed ? styles.passedText : styles.failedText
          ]}>
            {quizResult.passed ? 'PASSED' : 'FAILED'}
          </Text>
        </View>

        <View style={styles.resultDetails}>
          <Text style={styles.resultDetailsTitle}>Questions Review:</Text>
          
          {currentQuiz.questions?.map((question) => {
            const isCorrect = quizResult.correct_answers.includes(question.id);
            const userAnswer = userAnswers[question.id];
            const correctAnswer = quizResult.incorrect_answers.find(
              item => item.question_id === question.id
            )?.correct_answer || userAnswer;
            
            return (
              <View key={question.id} style={styles.questionReview}>
                <Text style={styles.questionText}>{question.question}</Text>
                <Text style={styles.answerText}>
                  Your answer: <Text style={isCorrect ? styles.correctText : styles.incorrectText}>
                    {userAnswer || 'Not answered'}
                  </Text>
                </Text>
                {!isCorrect && (
                  <Text style={styles.answerText}>
                    Correct answer: <Text style={styles.correctText}>{correctAnswer}</Text>
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Try Again" onPress={handleRetry} type="primary" style={styles.button} />
          <Button title="Back to Quizzes" onPress={handleBackToQuizzes} type="outline" style={styles.button} />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>{currentQuiz.title}</Text>
      <Text style={styles.description}>{currentQuiz.description}</Text>

      {currentQuiz.questions?.map((question) => (
        <QuizQuestion
          key={question.id}
          question={question.question}
          options={question.options}
          selectedOption={userAnswers[question.id]}
          onSelectOption={(answer) => handleSelectAnswer(question.id, answer)}
        />
      ))}

      <View style={styles.buttonContainer}>
        <Button
          title="Submit Quiz"
          onPress={handleSubmitQuiz}
          type="primary"
          style={styles.button}
          disabled={isLoading || Object.keys(userAnswers).length === 0}
        />
        <Button
          title="Cancel"
          onPress={handleBackToQuizzes}
          type="outline"
          style={styles.button}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.BACKGROUND,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 24,
  },
  buttonContainer: {
    marginTop: 24,
    gap: 12,
  },
  button: {
    width: '100%',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.ERROR,
    marginBottom: 16,
    textAlign: 'center',
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: COLORS.WHITE,
    padding: 16,
    borderRadius: 12,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  resultScore: {
    fontSize: 18,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 8,
  },
  resultStatus: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  passedText: {
    color: COLORS.SUCCESS,
  },
  failedText: {
    color: COLORS.ERROR,
  },
  resultDetails: {
    backgroundColor: COLORS.WHITE,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultDetailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 16,
  },
  questionReview: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  answerText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 4,
  },
  correctText: {
    color: COLORS.SUCCESS,
    fontWeight: '500',
  },
  incorrectText: {
    color: COLORS.ERROR,
    fontWeight: '500',
  },
});

export default QuizDetailScreen;