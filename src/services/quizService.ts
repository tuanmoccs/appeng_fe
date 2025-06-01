
import api from "./api"
import { ENDPOINTS } from "../constants/apiEndpoints"
import type { Quiz, QuizResult } from "../types/quiz"

// Lấy danh sách tất cả các quiz
export const getQuizzes = async (): Promise<Quiz[]> => {
  try {
    console.log("🧩 Fetching quizzes from:", ENDPOINTS.QUIZZES)

    // Check if we have a token before making the request
    const token = await import("@react-native-async-storage/async-storage").then((AsyncStorage) =>
      AsyncStorage.default.getItem("auth_token"),
    )

    if (!token) {
      console.error("❌ No auth token found when fetching quizzes")
      throw new Error("Bạn cần đăng nhập để xem quiz.")
    }

    console.log("🔑 Making request with token:", token.substring(0, 20) + "...")

    const response = await api.get(ENDPOINTS.QUIZZES)
    console.log("✅ Quizzes fetched successfully:", response.data)
    return response.data
  } catch (error: any) {
    console.error("❌ Get quizzes error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    })

    if (error.response?.status === 401) {
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")
    } else if (error.response?.status === 403) {
      throw new Error("Bạn không có quyền truy cập quiz.")
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    } else if (error.message.includes("Network Error")) {
      throw new Error("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.")
    } else {
      throw new Error("Không thể tải danh sách quiz. Vui lòng thử lại.")
    }
  }
}

// Lấy chi tiết một quiz cụ thể
export const getQuizById = async (quizId: number): Promise<Quiz> => {
  try {
    console.log(`🧩 Fetching quiz ${quizId} from:`, ENDPOINTS.QUIZ_DETAIL(quizId))
    const response = await api.get(ENDPOINTS.QUIZ_DETAIL(quizId))
    console.log(`✅ Quiz ${quizId} fetched successfully:`, response.data)
    return response.data
  } catch (error: any) {
    console.error(`❌ Get quiz ${quizId} error:`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    })

    if (error.response?.status === 401) {
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")
    } else if (error.response?.status === 404) {
      throw new Error("Không tìm thấy quiz.")
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    } else {
      throw new Error("Không thể tải chi tiết quiz. Vui lòng thử lại.")
    }
  }
}

// Nộp bài quiz
export const submitQuiz = async (quizId: number, answers: Record<string, string>): Promise<QuizResult> => {
  try {
    console.log(`📝 Submitting quiz ${quizId} with answers:`, answers)
    const response = await api.post(ENDPOINTS.QUIZ_SUBMIT(quizId), { answers })
    console.log(`✅ Quiz ${quizId} submitted successfully:`, response.data)
    return response.data
  } catch (error: any) {
    console.error(`❌ Submit quiz ${quizId} error:`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    })

    if (error.response?.status === 401) {
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    } else {
      throw new Error("Không thể nộp bài quiz. Vui lòng thử lại.")
    }
  }
}

// Lấy kết quả quiz của người dùng
export const getUserQuizResults = async (): Promise<QuizResult[]> => {
  try {
    console.log("📊 Fetching user quiz results...")
    const response = await api.get("/user/quiz-results")
    console.log("✅ User quiz results fetched successfully:", response.data)
    return response.data
  } catch (error: any) {
    console.error("❌ Get user quiz results error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    })

    if (error.response?.status === 401) {
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    } else {
      throw new Error("Không thể tải kết quả quiz. Vui lòng thử lại.")
    }
  }
}
