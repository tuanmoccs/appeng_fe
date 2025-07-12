// src/types/lesson.ts
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
export interface LessonItem {
  word: string
  meaning: string
  example: string
}

export interface LessonSection {
  title: string
  items: LessonItem[]
}

export interface LessonContent {
  sections: LessonSection[]
  duration?: number
}

export interface Lesson {
  id: number
  title: string
  description: string
  content?: LessonContent
  level: "beginner" | "intermediate" | "advanced"
  duration: number
  order: number
  progress: number
  is_completed: boolean
  is_locked: boolean
  content_preview?: {
    total_sections: number
    total_items: number
  }
  current_section?: number
  current_item?: number
}

export interface LessonStats {
  total_lessons: number
  completed_lessons: number
  in_progress_lessons: number
  overall_progress: number
  completion_rate: number
}