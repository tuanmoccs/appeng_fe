export interface TestQuestion {
  id: number
  test_id: number
  question: string
  options: string[] | string
  correct_answer?: string // Only available in backend
  difficulty: "easy" | "medium" | "hard"
  order: number
}

export interface Test {
  id: number
  title: string
  description: string
  type: "placement" | "achievement" | "practice"
  total_questions: number
  time_limit?: number // in minutes
  passing_score: number // percentage
  is_active: boolean
  questions?: TestQuestion[]
  created_at?: string
  updated_at?: string
}

export interface TestAnswer {
  question_id: number
  selected_answer: string
}

export interface TestResult {
  test_id: number
  score: number
  is_passed: boolean
  correct_answers: number
  total_questions: number
  result_id: number
}

export interface UserTestResult {
  id: number
  user_id: number
  test_id: number
  score: number
  total_questions: number
  time_taken?: number // in seconds
  correct_answers: number
  answers: TestAnswer[]
  passed: boolean
  created_at: string
  updated_at: string
}