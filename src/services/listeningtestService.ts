import api from "./api"
import { ENDPOINTS } from "../constants/apiEndpoints"

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

// Get all available listening tests
export const getListeningTests = async (): Promise<ListeningTest[]> => {
  try {
    console.log("🎧 Fetching listening tests from:", "/listening-tests")
    const response = await api.get(ENDPOINTS.LISTENINGS)
    console.log("✅ Listening tests fetched successfully:", response.data)
    return response.data.success ? response.data.tests : response.data
  } catch (error: any) {
    console.error("❌ Get listening tests error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    })

    if (error.response?.status === 401) {
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    } else {
      throw new Error("Không thể tải danh sách listening test. Vui lòng thử lại.")
    }
  }
}

// Get listening test by ID with sections and questions
export const getListeningTestById = async (testId: number): Promise<ListeningTest> => {
  try {
    console.log(`🎧 Fetching listening test ${testId}...`)
    const response = await api.get(ENDPOINTS.LESSON_DETAIL(testId))
    console.log(`✅ Listening test ${testId} raw response:`, response.data)

    // Handle both success response formats
    const testData = response.data.success ? response.data.test : response.data

    // Validate test data structure
    if (!testData) {
      throw new Error("Không tìm thấy dữ liệu listening test")
    }

    // Ensure sections array exists
    if (!testData.sections) {
      testData.sections = []
    }

    // Validate and process sections and questions
    if (testData.sections && Array.isArray(testData.sections)) {
      testData.sections = testData.sections.map((section: ListeningSection, sectionIndex: number) => {
        try {
          // Ensure questions array exists
          if (!section.questions) {
            section.questions = []
          }

          // Process questions
          if (section.questions && Array.isArray(section.questions)) {
            section.questions = section.questions.map((question: ListeningQuestion, questionIndex: number) => {
              try {
                // Options should already be processed by backend, but double-check
                if (typeof question.options === "string") {
                  question.options = JSON.parse(question.options)
                }

                // Ensure options is an array
                if (!Array.isArray(question.options)) {
                  console.warn(
                    `Section ${sectionIndex} Question ${questionIndex} options is not an array:`,
                    question.options,
                  )
                  question.options = []
                }

                return question
              } catch (parseError) {
                console.error(`❌ Error processing section ${sectionIndex} question ${questionIndex}:`, parseError)
                return {
                  ...question,
                  options: [], // Fallback to empty array
                }
              }
            })
          }

          return section
        } catch (sectionError) {
          console.error(`❌ Error processing section ${sectionIndex}:`, sectionError)
          return {
            ...section,
            questions: [],
          }
        }
      })
    }

    console.log(`✅ Listening test ${testId} processed successfully:`, {
      id: testData.id,
      title: testData.title,
      sectionsCount: testData.sections?.length || 0,
      totalQuestions: testData.total_questions,
    })

    return testData
  } catch (error: any) {
    console.error(`❌ Get listening test ${testId} error:`, error)

    if (error.response?.status === 404) {
      throw new Error("Không tìm thấy listening test.")
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    } else {
      throw new Error("Không thể tải listening test. Vui lòng thử lại.")
    }
  }
}

// Submit listening test answers
export const submitListeningTest = async (
  testId: number,
  answers: ListeningAnswer[],
  timeTaken?: number,
): Promise<ListeningResult> => {
  try {
    console.log(`🎧 Submitting listening test ${testId} with answers:`, answers)
    const response = await api.post(ENDPOINTS.LISTENING_TEST_SUBMIT(testId), {
      answers,
      time_taken: timeTaken,
    })
    console.log(`✅ Listening test ${testId} submitted successfully:`, response.data)

    // Handle response format
    return response.data.success ? response.data.result : response.data
  } catch (error: any) {
    console.error(`❌ Submit listening test ${testId} error:`, error)

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    } else {
      throw new Error("Không thể nộp bài listening test. Vui lòng thử lại.")
    }
  }
}

// Get user listening test results
export const getUserListeningResults = async (testId: number): Promise<UserListeningResult[]> => {
  try {
    console.log(`📊 Fetching user results for listening test ${testId}...`)
    const response = await api.get(ENDPOINTS.LISTENING_TEST_RESULTS(testId))
    console.log("✅ User listening test results fetched successfully:", response.data)

    // Handle response format
    return response.data.success ? response.data.results : response.data
  } catch (error: any) {
    console.error("❌ Get user listening test results error:", error)

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    } else {
      throw new Error("Không thể tải kết quả listening test. Vui lòng thử lại.")
    }
  }
}
