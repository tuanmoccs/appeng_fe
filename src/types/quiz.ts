// src/types/quiz.ts
export interface Question {
  id: number;
  quiz_id: number;
  question: string;
  options: string[];
  correct_answer?: string; // Optional vì không trả về khi làm quiz
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  lesson_id?: number;
  lesson?: {
    id: number;
    title: string;
  };
  questions?: Question[];
  user_latest_result?: UserLatestResult | null; // THÊM FIELD NÀY
}

export interface UserLatestResult {
  score: number;
  completed_at: string;
  total_questions: number;
}

export interface QuizResult {
  quiz_id: number;
  score: number;
  total_questions: number;
  percentage: number;
  correct_answers: number[];
  incorrect_answers: IncorrectAnswer[];
  passed: boolean;
}

export interface IncorrectAnswer {
  question_id: number;
  user_answer: string | null;
  correct_answer: string;
}

export interface UserAnswers {
  [questionId: number]: string;
}