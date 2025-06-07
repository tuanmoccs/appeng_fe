import api from "./api"

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
  answers: TestAnswer[]
  passed: boolean
  created_at: string
  updated_at: string
}

// Get all available tests
export const getTests = async (): Promise<Test[]> => {
  try {
    console.log("📝 Fetching tests from:", "/tests")
    const response = await api.get("/tests")
    console.log("✅ Tests fetched successfully:", response.data)
    return response.data
  } catch (error: any) {
    console.error("❌ Get tests error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    })

    if (error.response?.status === 401) {
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    } else {
      throw new Error("Không thể tải danh sách test. Vui lòng thử lại.")
    }
  }
}

// Get test by ID with questions
export const getTestById = async (testId: number): Promise<Test> => {
  try {
    console.log(`📝 Fetching test ${testId}...`)
    const response = await api.get(`/tests/${testId}`)
    console.log(`✅ Test ${testId} raw response:`, response.data)

    // Handle both success response formats
    const testData = response.data.success ? response.data.test : response.data

    // Validate test data structure
    if (!testData) {
      throw new Error("Không tìm thấy dữ liệu test")
    }

    // Ensure questions array exists
    if (!testData.questions) {
      testData.questions = []
    }

    // Validate and process questions
    if (testData.questions && Array.isArray(testData.questions)) {
      testData.questions = testData.questions.map((question: TestQuestion, index: number) => {
        try {
          // Options should already be processed by backend, but double-check
          if (typeof question.options === "string") {
            question.options = JSON.parse(question.options)
          }

          // Ensure options is an array
          if (!Array.isArray(question.options)) {
            console.warn(`Question ${index} options is not an array:`, question.options)
            question.options = []
          }

          return question
        } catch (parseError) {
          console.error(`❌ Error processing question ${index}:`, parseError)
          return {
            ...question,
            options: [], // Fallback to empty array
          }
        }
      })
    }

    console.log(`✅ Test ${testId} processed successfully:`, {
      id: testData.id,
      title: testData.title,
      questionsCount: testData.questions?.length || 0,
      firstQuestionOptions: testData.questions?.[0]?.options || "No questions",
    })

    return testData
  } catch (error: any) {
    console.error(`❌ Get test ${testId} error:`, error)

    if (error.response?.status === 404) {
      throw new Error("Không tìm thấy test.")
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    } else {
      throw new Error("Không thể tải test. Vui lòng thử lại.")
    }
  }
}

// Submit test answers
export const submitTest = async (testId: number, answers: TestAnswer[]): Promise<TestResult> => {
  try {
    console.log(`📝 Submitting test ${testId} with answers:`, answers)
    const response = await api.post(`/tests/${testId}/submit`, { answers })
    console.log(`✅ Test ${testId} submitted successfully:`, response.data)

    // Handle response format
    return response.data.success ? response.data.result : response.data
  } catch (error: any) {
    console.error(`❌ Submit test ${testId} error:`, error)

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    } else {
      throw new Error("Không thể nộp bài test. Vui lòng thử lại.")
    }
  }
}

// Get user test results
export const getUserTestResults = async (testId: number): Promise<UserTestResult[]> => {
  try {
    console.log(`📊 Fetching user results for test ${testId}...`)
    const response = await api.get(`/tests/${testId}/results`)
    console.log("✅ User test results fetched successfully:", response.data)

    // Handle response format
    return response.data.success ? response.data.results : response.data
  } catch (error: any) {
    console.error("❌ Get user test results error:", error)

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    } else {
      throw new Error("Không thể tải kết quả test. Vui lòng thử lại.")
    }
  }
}
