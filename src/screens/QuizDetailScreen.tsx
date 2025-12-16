// src/screens/QuizDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../constants/colors';
import Button from '../components/Button';
import QuizQuestion from '../components/QuizQuestion';
import { 
  fetchQuizById, 
  submitQuiz, 
  setUserAnswer, 
  clearUserAnswers, 
  clearQuizResult 
} from '../store/slices/quizSlice';
import type { RootState, AppDispatch } from '../store/store';
import { styles } from '../styles/QuizDetailScreen.styles';
import QuizChatBot from '../components/ChatBotQuiz';

const QuizDetailScreen = ({ route, navigation }: any) => {
  const { quizId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { currentQuiz, userAnswers, quizResult, isLoading, error } = useSelector(
    (state: RootState) => state.quiz
  );
  const [showChatBot, setShowChatBot] = useState(false);
  
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
      .then((result) => {
        // NAVIGATE ĐẾN REVIEW SCREEN
        navigation.navigate('QuizReview', {
          quiz: currentQuiz,
          result: result,
          userAnswers: userAnswers,
        });
      })
      .catch((err) => {
        console.error('Submit quiz error:', err);
      });
  };

  const handleBackToQuizzes = () => {
    navigation.goBack();
  };

  if (isLoading && !currentQuiz) {
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
        <Button 
          title="Go Back" 
          onPress={handleBackToQuizzes} 
          type="primary" 
          style={styles.button} 
        />
      </View>
    );
  }

  if (!currentQuiz) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Quiz not found</Text>
        <Button 
          title="Go Back" 
          onPress={handleBackToQuizzes} 
          type="primary" 
          style={styles.button} 
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>{currentQuiz.title}</Text>
        <Text style={styles.description}>{currentQuiz.description}</Text>
        
        {/* CHATBOT BUTTON */}
        <TouchableOpacity 
          style={styles.chatBotButton} 
          onPress={() => setShowChatBot(true)}
        >
          <Text style={styles.chatBotButtonText}>🤖</Text>
        </TouchableOpacity>

        {/* PROGRESS INDICATOR */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Progress: {Object.keys(userAnswers).length} / {currentQuiz.questions?.length || 0}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${(Object.keys(userAnswers).length / (currentQuiz.questions?.length || 1)) * 100}%` 
                }
              ]} 
            />
          </View>
        </View>

        {/* QUESTIONS */}
        {currentQuiz.questions?.map((question, index) => (
          <View key={question.id} style={styles.questionWrapper}>
            <Text style={styles.questionNumber}>Question {index + 1}</Text>
            <QuizQuestion
              question={question.question}
              options={question.options}
              selectedOption={userAnswers[question.id]}
              onSelectOption={(answer) => handleSelectAnswer(question.id, answer)}
            />
          </View>
        ))}

        {/* BUTTONS */}
        <View style={styles.buttonContainer}>
          <Button
            title={isLoading ? "Submitting..." : "Submit Quiz"}
            onPress={handleSubmitQuiz}
            type="primary"
            style={styles.button}
            disabled={
              isLoading || 
              Object.keys(userAnswers).length !== currentQuiz.questions?.length
            }
          />
          <Button
            title="Cancel"
            onPress={handleBackToQuizzes}
            type="outline"
            style={styles.button}
          />
        </View>
      </ScrollView>

      {/* CHATBOT MODAL */}
      <QuizChatBot
        quizData={{
          ...currentQuiz,
          questions: currentQuiz.questions?.map((q) => ({
            ...q,
            correct_answer: undefined,
          })),
        }}
        currentQuestionId={undefined}
        isVisible={showChatBot}
        onClose={() => setShowChatBot(false)}
      />
    </View>
  );
};

export default QuizDetailScreen;