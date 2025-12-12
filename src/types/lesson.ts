// src/types/lesson.ts

// Content Types
export interface TheorySection {
  type: 'theory'
  title: string
  content: string
  image_url?: string
  examples?: {
    sentence: string
    translation: string
    highlight?: string
  }[]
}

export interface VocabularyItem {
  word: string
  pronunciation?: string
  meaning: string
  image_url?: string
  audio_url?: string
  example?: string
  example_translation?: string
}

export interface VocabularySection {
  type: 'vocabulary'
  title: string
  items: VocabularyItem[]
}

export interface PracticeSection {
  type: 'practice'
  title: string
  exercises: {
    instruction: string
    sentence: string
    answer: string
    options?: string[]
  }[]
}

export type LessonSection = TheorySection | VocabularySection | PracticeSection

export interface LessonContent {
  sections: LessonSection[]
}

// Quiz Types
export interface QuizQuestion {
  id: number
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'matching'
  question: string
  image_url?: string
  options?: string[]
  pairs?: { left: string; right: string }[]
}

export interface Quiz {
  title: string
  description?: string
  time_limit: number
  passing_score: number
  total_questions: number
  questions: QuizQuestion[]
}

export interface QuizAnswer {
  question_id: number
  user_answer: string
}

export interface QuizResult {
  score: number
  total_questions: number
  correct_answers: number
  is_passed: boolean
  passing_score: number
  attempt_number: number
  detailed_answers: {
    question_id: number
    user_answer: string
    correct_answer: string
    is_correct: boolean
    explanation?: string
  }[]
}

// Lesson Types
export interface Lesson {
  id: number
  title: string
  description: string
  content?: LessonContent
  quiz?: Quiz
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: number
  order: number
  progress: number
  is_completed: boolean
  is_locked: boolean
  has_quiz: boolean
  quiz_passed?: boolean
  content_preview?: {
    total_sections: number
    total_items: number
  }
  quiz_result?: {
    score: number
    is_passed: boolean
    attempt_number: number
    created_at: string
  }
  current_section?: number
  current_item?: number
}

export interface LessonStats {
  total_lessons: number
  completed_lessons: number
  in_progress_lessons: number
  passed_quizzes: number
  overall_progress: number
  completion_rate: number
}