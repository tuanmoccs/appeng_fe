import api from "./api"
import { ENDPOINTS } from "../constants/apiEndpoints"
import { API_STORAGE } from "../constants/apiEndpoints"
import type { ListeningTest, ListeningSection, ListeningQuestion, ListeningAnswer, ListeningResult, UserListeningResult } from "../types/listeningtest";
// Fixed function to get full audio URL
export function getFullAudioUrl(audioPath: string | undefined): string | undefined {
  if (!audioPath) return undefined;
  
  // Nếu đã là URL đầy đủ thì trả về luôn
  if (audioPath.startsWith('http://') || audioPath.startsWith('https://')) {
    return audioPath;
  }
  
  // Xử lý đường dẫn từ storage
  // Loại bỏ 'storage/' nếu có trong audioPath vì API_STORAGE đã có rồi
  const cleanPath = audioPath.replace(/^\/?(storage\/)?/, '');
  
  // Đảm bảo không có double slashes
  const baseUrl = API_STORAGE.endsWith('/') ? API_STORAGE.slice(0, -1) : API_STORAGE;
  const finalPath = cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath;
  
  return `${baseUrl}/${finalPath}`;
}

// Validate if URL is accessible
export function isValidAudioUrl(url: string): boolean {
  if (!url) return false;
  
  // Check if it's a valid HTTP/HTTPS URL
  try {
    const urlObject = new URL(url);
    return urlObject.protocol === 'http:' || urlObject.protocol === 'https:';
  } catch {
    return false;
  }
}

// Get all available listening tests
export const getListeningTests = async (): Promise<ListeningTest[]> => {
  try {
    console.log("🎧 Fetching listening tests from:", ENDPOINTS.LISTENINGS)
    const response = await api.get(ENDPOINTS.LISTENINGS)
    console.log("✅ Listening tests response:", response.data)
    
    if (response.data.success) {
      return response.data.tests
    } else {
      throw new Error(response.data.message || "Không thể tải danh sách listening test")
    }
  } catch (error: any) {
    console.error("❌ Get listening tests error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    })

    if (error.response?.status === 401) {
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")
    } else if (error.response?.status === 404) {
      throw new Error("API endpoint không tìm thấy. Kiểm tra lại URL.")
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
    const endpoint = ENDPOINTS.LISTENING_DETAIL(testId)
    console.log(`🎧 Fetching listening test ${testId} from:`, endpoint)
    
    const response = await api.get(endpoint)
//     console.log(`✅ Listening test ${testId} raw response:`, {
//       status: response.status,
//       success: response.data.success,
//       hasTest: !!response.data.test,
//       testId: response.data.test?.id,
//       sectionsCount: response.data.test?.sections?.length,
//     })

    if (!response.data.success) {
      throw new Error(response.data.message || "API trả về không thành công")
    }

    const testData = response.data.test
    
    if (!testData) {
      throw new Error("Không tìm thấy dữ liệu listening test trong response")
    }

    if (!testData.id) {
      throw new Error("Test data thiếu ID")
    }

    if (!testData.sections) {
      console.warn("Test data không có sections, khởi tạo mảng rỗng")
      testData.sections = []
    }

    if (!Array.isArray(testData.sections)) {
      console.error("Test sections không phải là mảng:", typeof testData.sections)
      throw new Error("Dữ liệu sections không hợp lệ")
    }

    // Xử lý sections và audio URLs
    testData.sections = testData.sections.map((section: ListeningSection, sectionIndex: number) => {
      try {
        console.log(`Processing section ${sectionIndex}:`, {
          id: section.id,
          title: section.title,
          questionsCount: section.questions?.length || 0,
          hasAudioUrl: !!section.audio_url,
          rawAudioUrl: section.audio_url,
        })

        // Xử lý audio URL cho section - IMPORTANT FIX
        if (section.audio_url) {
          if (section.audio_url.startsWith('http://') || section.audio_url.startsWith('https://')) {
            console.log(`✅ Section ${sectionIndex} using full audio URL:`, section.audio_url);
            // Không cần xử lý gì thêm
          } else {
            // Chỉ xử lý nếu là relative path
            const fullAudioUrl = getFullAudioUrl(section.audio_url);
            if (fullAudioUrl && isValidAudioUrl(fullAudioUrl)) {
              section.audio_url = fullAudioUrl;
              console.log(`✅ Section ${sectionIndex} audio URL processed:`, fullAudioUrl);
            } else {
              console.warn(`❌ Invalid audio URL for section ${sectionIndex}:`, fullAudioUrl);
              section.audio_url = undefined;
            }
          }
        }

        // Ensure questions array exists
        if (!section.questions) {
          console.warn(`Section ${sectionIndex} không có questions, khởi tạo mảng rỗng`)
          section.questions = []
        }

        if (!Array.isArray(section.questions)) {
          console.error(`Section ${sectionIndex} questions không phải là mảng:`, typeof section.questions)
          section.questions = []
        }

        // Process questions
        section.questions = section.questions.map((question: ListeningQuestion, questionIndex: number) => {
          try {
            // Options should already be processed by backend, but double-check
            if (typeof question.options === "string") {
              console.log(`Parsing options for question ${questionIndex}:`, question.options)
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

            // Xử lý audio URL cho question nếu có - IMPORTANT FIX
//             if (question.audio_url) {
//               const fullAudioUrl = getFullAudioUrl(question.audio_url);
//               if (fullAudioUrl && isValidAudioUrl(fullAudioUrl)) {
//                 question.audio_url = fullAudioUrl;
//               } else {
//                 console.warn(`❌ Invalid audio URL for question ${questionIndex}:`, fullAudioUrl);
//                 question.audio_url = undefined; // Set to undefined instead of keeping invalid URL
//               }
//             }

            console.log(`Question ${questionIndex} processed:`, {
              id: question.id,
              hasOptions: question.options.length > 0,
              optionsCount: question.options.length,
              hasAudio: !!question.audio_url,
            })

            return question
          } catch (parseError) {
            console.error(`❌ Error processing section ${sectionIndex} question ${questionIndex}:`, parseError)
            return {
              ...question,
              options: [], // Fallback to empty array
              audio_url: undefined, // Clear invalid audio URL
            }
          }
        })

        return section
      } catch (sectionError) {
        console.error(`❌ Error processing section ${sectionIndex}:`, sectionError)
        return {
          ...section,
          questions: [],
          audio_url: undefined, // Clear invalid audio URL
        }
      }
    })

    // Final validation
    const totalQuestions = testData.sections.reduce((sum: number, section: ListeningSection) => {
      return sum + (section.questions?.length || 0)
    }, 0)

    console.log(`✅ Listening test ${testId} processed successfully:`, {
      id: testData.id,
      title: testData.title,
      sectionsCount: testData.sections?.length || 0,
      totalQuestions: totalQuestions,
      expectedQuestions: testData.total_questions,
      sectionsWithAudio: testData.sections.filter((s: ListeningSection) => s.audio_url).length,
    })

    if (totalQuestions !== testData.total_questions) {
      console.warn(`⚠️ Question count mismatch: calculated ${totalQuestions}, expected ${testData.total_questions}`)
    }

    return testData
  } catch (error: any) {
    console.error(`❌ Get listening test ${testId} error:`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    })

    if (error.response?.status === 404) {
      throw new Error("Không tìm thấy listening test.")
    } else if (error.response?.status === 400) {
      throw new Error("ID listening test không hợp lệ.")
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
    console.log(`🎧 Submitting listening test ${testId} with answers:`, {
      answersCount: answers.length,
      timeTaken,
    })
    
    const response = await api.post(ENDPOINTS.LISTENING_TEST_SUBMIT(testId), {
      answers,
      time_taken: timeTaken,
    })
    
    console.log(`✅ Listening test ${testId} submitted successfully:`, response.data)

    // Handle response format
    if (response.data.success) {
      return response.data.result
    } else {
      throw new Error(response.data.message || "Không thể nộp bài")
    }
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
    if (response.data.success) {
      return response.data.results
    } else {
      throw new Error(response.data.message || "Không thể tải kết quả")
    }
  } catch (error: any) {
    console.error("❌ Get user listening test results error:", error)

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    } else {
      throw new Error("Không thể tải kết quả listening test. Vui lòng thử lại.")
    }
  }
}
