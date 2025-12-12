// src/types/test.ts

export interface TestQuestion {
  id: number
  question: string
  options: string[]
  difficulty: "easy" | "medium" | "hard"
  order: number
}

export interface TestPassage {
  id: number
  title?: string
  content: string
}

export interface StandaloneSection {
  type: "standalone"
  order: number
  question: TestQuestion
}

export interface PassageSection {
  type: "passage"
  order: number
  passage: TestPassage
  questions: TestQuestion[]
}

export type TestSection = StandaloneSection | PassageSection

export interface Test {
  id: number
  title: string
  description: string
  type: "placement" | "achievement" | "practice"
  total_questions: number
  time_limit?: number
  passing_score: number
  is_active: boolean
  sections: TestSection[]
  created_at?: string
  updated_at?: string
}

export interface TestAnswer {
  question_id: number
  selected_answer: string
}

export interface DetailedQuestionResult {
  question_id: number
  question: string
  options: string[]
  user_answer: string
  correct_answer: string
  is_correct: boolean
}

export interface TestResult {
  test_id: number
  score: number
  is_passed: boolean
  correct_answers: number
  total_questions: number
  result_id: number
  detailed_results: DetailedQuestionResult[]
}

export interface UserTestResult {
  id: number
  user_id: number
  test_id: number
  score: number
  total_questions: number
  correct_answers: number
  passed: boolean
  created_at: string
}