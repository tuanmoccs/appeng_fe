// src/screens/QuizScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../constants/colors';
import Button from '../components/Button';
import QuizStatsCard from '../components/QuizStatsCard';
import { fetchQuizzes } from '../store/slices/quizSlice';
import type { RootState, AppDispatch } from '../store/store';
import type { Quiz } from '../types/quiz';
import { styles } from '../styles/QuizScreen.styles';

const QuizScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { quizzes, isLoading, error } = useSelector((state: RootState) => state.quiz);

  useEffect(() => {
    dispatch(fetchQuizzes());
  }, [dispatch]);

  // Refresh khi quay lại từ màn khác
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      dispatch(fetchQuizzes());
    });

    return unsubscribe;
  }, [navigation, dispatch]);

  const handleQuizPress = (quiz: Quiz) => {
    navigation.navigate('QuizDetail', { quizId: quiz.id });
  };

  if (isLoading) {
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
          title="Try Again" 
          onPress={() => dispatch(fetchQuizzes())} 
          type="primary" 
          style={styles.button} 
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Quizzes</Text>

      {quizzes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No quizzes available</Text>
        </View>
      ) : (
        <FlatList
          data={quizzes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.quizCard}>
              <View style={styles.quizHeader}>
                <Text style={styles.quizTitle}>{item.title}</Text>
                {/* {item.lesson && (
                  <Text style={styles.lessonBadge}>
                    {item.lesson.title}
                  </Text>
                )} */}
              </View>
              
              <Text style={styles.quizDescription}>{item.description}</Text>
              
              {/* HIỂN THỊ STATS CARD NẾU CÓ KẾT QUẢ */}
              {item.user_latest_result && (
                <QuizStatsCard latestResult={item.user_latest_result} />
              )}

              <Button 
                title={item.user_latest_result ? "🔄 Retry Quiz" : "▶️ Start Quiz"} 
                onPress={() => handleQuizPress(item)} 
                type={item.user_latest_result ? "outline" : "primary"}
                style={styles.button} 
              />
            </View>
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default QuizScreen;