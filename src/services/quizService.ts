// src/services/quizService.ts
import api from './api';
import { ENDPOINTS } from '../constants/apiEndpoints';
import type { Quiz, QuizQuestion, QuizResult } from '../types/quiz';

// Lấy danh sách tất cả các quiz
export const getQuizzes = async (): Promise<Quiz[]> => {
  try {
    const response = await api.get(ENDPOINTS.QUIZZES);
    return response.data;
  } catch (error) {
    console.error('Get quizzes error:', error);
    throw error;
  }
};

// Lấy chi tiết một quiz cụ thể
export const getQuizById = async (quizId: number): Promise<Quiz> => {
  try {
    const response = await api.get(ENDPOINTS.QUIZ_DETAIL(quizId));
    return response.data;
  } catch (error) {
    console.error(`Get quiz ${quizId} error:`, error);
    throw error;
  }
};

// Lấy danh sách quiz theo bài học
export const getQuizzesByLessonId = async (lessonId: number): Promise<Quiz[]> => {
  try {
    const response = await api.get(`/lessons/${lessonId}/quizzes`);
    return response.data;
  } catch (error) {
    console.error(`Get quizzes for lesson ${lessonId} error:`, error);
    throw error;
  }
};

// Nộp bài quiz
export const submitQuiz = async (quizId: number, answers: Record<string, string>): Promise<QuizResult> => {
  try {
    const response = await api.post(ENDPOINTS.QUIZ_SUBMIT(quizId), { answers });
    return response.data;
  } catch (error) {
    console.error(`Submit quiz ${quizId} error:`, error);
    throw error;
  }
};

// Lấy kết quả quiz của người dùng
export const getUserQuizResults = async (): Promise<QuizResult[]> => {
  try {
    const response = await api.get('/user/quiz-results');
    return response.data;
  } catch (error) {
    console.error('Get user quiz results error:', error);
    throw error;
  }
};