export interface ListeningQuestion {
  id: number
  listening_section_id: number
  question: string
  options: string[]
  audio_file?: string
  audio_url?: string
  audio_start_time?: number
  audio_end_time?: number
  order: number
}

export interface ListeningSection {
  id: number
  listening_test_id: number
  title: string
  instructions?: string
  audio_file?: string
  audio_url?: string
  audio_duration?: number
  question_type: "single" | "multiple"
  order: number
  questions: ListeningQuestion[]
}

export interface ListeningTest {
  id: number
  title: string
  description?: string
  type: "placement" | "achievement" | "practice"
  total_questions: number
  time_limit?: number // in minutes
  passing_score: number // percentage
  is_active: boolean
  sections: ListeningSection[]
  created_at?: string
  updated_at?: string
}

export interface ListeningAnswer {
  question_id: number
  selected_answer: string
}

export interface ListeningResult {
  test_id: number
  score: number
  is_passed: boolean
  correct_answers: number
  total_questions: number
  result_id: number
}

export interface UserListeningResult {
  id: number
  user_id: number
  listening_test_id: number
  score: number
  total_questions: number
  correct_answers: number
  time_taken?: number // in seconds
  answers: ListeningAnswer[]
  passed: boolean
  created_at: string
  updated_at: string
}