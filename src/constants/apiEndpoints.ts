// src/constants/apiEndpoints.ts
// Base API URL - Update to your actual backend URL
export const API_BASE_URL = "http://10.0.2.2:8000/api"; // 10.0.2.2 points to host machine's localhost from Android emulator

// API endpoints
export const ENDPOINTS = {
  // Auth endpoints
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  LOGOUT: "/auth/logout",
  USER_PROFILE: "/auth/user",

  // Lesson endpoints
  LESSONS: "/lessons",
  LESSON_DETAIL: (id: number) => `/lessons/${id}`,
  LESSON_WORDS: (id: number) => `/lessons/${id}/words`,
  LESSON_COMPLETE: (id: number) => `/lessons/${id}/complete`,
  LESSON_PROGRESS: (id: number) => `/lessons/${id}/progress`,

  // Word endpoints
  WORDS: "/words",
  WORD_DETAIL: (id: number) => `/words/${id}`,

  // Quiz endpoints
  QUIZZES: "/quizzes",
  QUIZ_DETAIL: (id: number) => `/quizzes/${id}`,
  QUIZ_SUBMIT: (id: number) => `/quizzes/${id}/submit`,

  // User endpoints
  USER_STATS: "/user/stats",
  USER_ACHIEVEMENTS: "/user/achievements",
};