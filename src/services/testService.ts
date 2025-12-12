// src/services/testService.ts

import api from "./api"
import type { Test, TestAnswer, TestResult, UserTestResult } from "../types/test"

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

export const getTestById = async (testId: number): Promise<Test> => {
  try {
    console.log(`📝 Fetching test ${testId}...`)
    const response = await api.get(`/tests/${testId}`)
    console.log(`✅ Test ${testId} raw response:`, response.data)

    const testData = response.data.success ? response.data.test : response.data

    if (!testData) {
      throw new Error("Không tìm thấy dữ liệu test")
    }

    // Đảm bảo sections tồn tại
    if (!testData.sections) {
      testData.sections = []
    }

    // Process sections
    if (Array.isArray(testData.sections)) {
      testData.sections = testData.sections.map((section: any) => {
        if (section.type === "standalone") {
          // Process standalone question
          if (typeof section.question.options === "string") {
            section.question.options = JSON.parse(section.question.options)
          }
          if (!Array.isArray(section.question.options)) {
            section.question.options = []
          }
        } else if (section.type === "passage") {
          // Process passage questions
          section.questions = section.questions.map((question: any) => {
            if (typeof question.options === "string") {
              question.options = JSON.parse(question.options)
            }
            if (!Array.isArray(question.options)) {
              question.options = []
            }
            return question
          })
        }
        return section
      })
    }

    console.log(`✅ Test ${testId} processed successfully:`, {
      id: testData.id,
      title: testData.title,
      sectionsCount: testData.sections?.length || 0,
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

export const submitTest = async (testId: number, answers: TestAnswer[]): Promise<TestResult> => {
  try {
    console.log(`📝 Submitting test ${testId} with answers:`, answers)
    const response = await api.post(`/tests/${testId}/submit`, { answers })
    console.log(`✅ Test ${testId} submitted successfully:`, response.data)

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

export const getUserTestResults = async (testId: number): Promise<UserTestResult[]> => {
  try {
    console.log(`📊 Fetching user results for test ${testId}...`)
    const response = await api.get(`/tests/${testId}/results`)
    console.log("✅ User test results fetched successfully:", response.data)

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