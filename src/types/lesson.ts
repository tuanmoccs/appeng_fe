// src/types/lesson.ts
export interface Lesson {
  id: number;
  title: string;
  description: string;
  content: any;
  level: string;
  duration: number;
  is_completed?: boolean;
  progress_percentage?: number;
  created_at: string;
  updated_at: string;
}

export interface Word {
  id: number;
  word: string;
  translation: string;
  pronunciation: string;
  image_url?: string;
  audio_url?: string;
  example_sentence?: string;
  lesson_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  lesson_id: number;
  questions: QuizQuestion[];
  is_completed?: boolean;
  score?: number;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct_answer: string;
  quiz_id: number;
}