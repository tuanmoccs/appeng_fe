// src/constants/apiEndpoints.ts
// Base API URL - Update to your actual backend URL
export const API_BASE_URL = " http://10.0.2.2:8000/api" // 10.0.2.2 points to host machine's localhost from Android emulator
export const API_STORAGE = " http://10.0.2.2:8000/storage"
// API endpoints
export const ENDPOINTS = {
  // Auth endpoints
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  LOGOUT: "/auth/logout",
  USER: "/auth/user",
  USER_PROFILE: "/auth/user",
  FORGOT_PASSWORD: "/auth/forgot-password",
  SEND_RESET_OTP: '/auth/send-reset-otp',
  RESET_PASSWORD_OTP: '/auth/reset-password-otp',
  UPDATE_PROFILE: "/auth/profile",
  CHANGE_PASSWORD: "/auth/change-password",
  USER_ACHIEVEMENTS: "/auth/achievements",
  USER_STATS: "/auth/stats",

  // Lesson endpoints
  LESSONS: "/lessons",
  LESSON_DETAIL: (id: number) => `/lessons/${id}`,
  LESSON_WORDS: (id: number) => `/lessons/${id}/words`,
  LESSON_COMPLETE: (id: number) => `/lessons/${id}/complete`,
  LESSON_PROGRESS: (id: number) => `/lessons/${id}/progress`,
  LESSON_STATS: "/lessons/stats",

  // Word endpoints
  WORDS: "/words",
  WORD_DETAIL: (id: number) => `/words/${id}`,

  // Quiz endpoints
  QUIZZES: "/quizzes",
  QUIZ_DETAIL: (id: number) => `/quizzes/${id}`,
  QUIZ_SUBMIT: (id: number) => `/quizzes/${id}/submit`,
  
  //Test endpoints
  TESTS: "/tests",
  TEST_DETAIL: (id:number) => `/tests/${id}`,
  TEST_SUBMIT: (id:number) => `/tests/${id}/submit`,
  TEST_RESULT: (id:number) => `/tests/${id}/results`,

  //Listening-test endpoints
  LISTENINGS: "/listening-tests",
  LISTENING_DETAIL: (id: number) => `/listening-tests/${id}`,
  LISTENING_TEST_SUBMIT: (id : number) => `/listening-tests/${id}/submit`,
  LISTENING_TEST_RESULTS: (id : number) => `/listening-tests/${id}/results`,

  // User endpoints
  USER_QUIZ_RESULTS: "/user/quiz-results",  
}
