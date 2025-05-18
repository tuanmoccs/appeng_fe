// src/types/quiz.ts
export interface Quiz {
  id: number;
  title: string;
  description: string;
  lesson_id: number;
  questions?: QuizQuestion[];
  created_at?: string;
  updated_at?: string;
}

export interface QuizQuestion {
  id: number;
  quiz_id: number;
  question: string;
  options: string[];
  correct_answer?: string; // Chỉ có ở backend, không gửi đến frontend
}

export interface QuizResult {
  quiz_id: number;
  score: number;
  total_questions: number;
  percentage: number;
  correct_answers: number[];
  incorrect_answers: Array<{
    question_id: number;
    user_answer: string | null;
    correct_answer: string;
  }>;
  passed: boolean;
}

export interface UserQuizResult {
  id: number;
  user_id: number;
  quiz_id: number;
  score: number;
  total_questions: number;
  answers: Record<string, string>;
  created_at: string;
  updated_at: string;
  quiz?: {
    id: number;
    title: string;
    lesson_id: number;
  };
}