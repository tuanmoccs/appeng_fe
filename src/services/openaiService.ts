import { OPENAI_API_KEY } from "../constants/config"
import type { Test, TestSection } from "../types/test"

export interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface OpenAIResponse {
  choices: Array<{
    message: {
      role: string
      content: string
    }
  }>
  error?: {
    message: string
    type: string
    code: string
  }
}

class OpenAIService {
  private apiKey: string
  private baseUrl = "https://api.openai.com/v1/chat/completions"

  constructor() {
    this.apiKey = OPENAI_API_KEY
    this.validateApiKey()
  }

  private validateApiKey(): void {
    if (!this.apiKey) {
      throw new Error("OpenAI API key chưa được cấu hình")
    }
    if (!this.apiKey.startsWith("sk-")) {
      throw new Error("OpenAI API key không hợp lệ - phải bắt đầu bằng 'sk-'")
    }
  }

  async sendMessage(messages: ChatMessage[]): Promise<string> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: messages,
          max_tokens: 500,
          temperature: 0.7,
        }),
      })

      const data: OpenAIResponse = await response.json()

      // Xử lý các loại lỗi cụ thể
      if (!response.ok) {
        switch (response.status) {
          case 401:
            throw new Error("API key không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại API key.")
          case 403:
            throw new Error("Không có quyền truy cập. Kiểm tra permissions của API key.")
          case 429:
            throw new Error("Đã vượt quá giới hạn request. Vui lòng thử lại sau ít phút.")
          case 500:
            throw new Error("Lỗi server của OpenAI. Vui lòng thử lại sau.")
          case 503:
            throw new Error("Dịch vụ OpenAI đang bảo trì. Vui lòng thử lại sau.")
          default:
            const errorMsg = data.error?.message || `Lỗi API: ${response.status}`
            throw new Error(errorMsg)
        }
      }

      if (!data.choices || data.choices.length === 0) {
        throw new Error("Không nhận được phản hồi từ AI")
      }

      return data.choices[0]?.message?.content || "Xin lỗi, tôi không thể trả lời câu hỏi này."
    } catch (error) {
      console.error("OpenAI Service Error:", error)

      // Xử lý lỗi network
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Không thể kết nối với OpenAI. Kiểm tra kết nối internet.")
      }

      // Ném lại lỗi đã được xử lý
      if (error instanceof Error) {
        throw error
      }

      // Lỗi không xác định
      throw new Error("Đã xảy ra lỗi không xác định. Vui lòng thử lại.")
    }
  }

  createSystemPrompt(testData: Test): string {
    let questionsContext = ""
    let questionNumber = 1

    testData.sections?.forEach((section: TestSection) => {
      if (section.type === "standalone") {
        questionsContext += `\n\nCâu ${questionNumber}: ${section.question.question}\nCác lựa chọn: ${section.question.options.join(", ")}\nĐộ khó: ${section.question.difficulty}`
        questionNumber++
      } else if (section.type === "passage") {
        questionsContext += `\n\n=== BÀI ĐỌC ===`
        if (section.passage.title) {
          questionsContext += `\nTiêu đề: ${section.passage.title}`
        }
        questionsContext += `\nNội dung: ${section.passage.content}\n`

        section.questions.forEach((q) => {
          questionsContext += `\nCâu ${questionNumber}: ${q.question}\nCác lựa chọn: ${q.options.join(", ")}\nĐộ khó: ${q.difficulty}\n`
          questionNumber++
        })
      }
    })

    return `Bạn là một AI assistant chuyên về tiếng Anh, hỗ trợ học sinh trong bài test "${testData.title}".

THÔNG TIN BÀI TEST:
- Tiêu đề: ${testData.title}
- Mô tả: ${testData.description}
- Loại test: ${testData.type}
- Tổng số câu hỏi: ${testData.total_questions}
- Thời gian: ${testData.time_limit || "Không giới hạn"} phút
- Điểm đạt: ${testData.passing_score}%

NỘI DUNG BÀI TEST (bao gồm cả bài đọc và câu hỏi đơn):
${questionsContext}

VAI TRÒ CỦA BẠN:
1. Giải thích ngữ pháp và từ vựng trong các câu hỏi
2. Hướng dẫn cách làm bài test hiệu quả
3. Giải đáp thắc mắc về nội dung tiếng Anh
4. Đưa ra gợi ý học tập
5. Có thể trực tiếp đưa ra đáp án đúng, sau khi hướng dẫn cách suy luận mà người dùng vẫn hỏi đáp án đúng là gì
6. Hỗ trợ hiểu nội dung bài đọc (passage) và cách trả lời câu hỏi liên quan

QUY TẮC:
- Trả lời bằng tiếng Việt
- Giải thích rõ ràng, dễ hiểu
- Khuyến khích học sinh tự suy luận
- Đưa ra ví dụ minh họa khi cần thiết
- Khi có bài đọc, giúp học sinh hiểu context và tìm thông tin trong bài đọc`
  }

  async analyzeQuestion(testData: Test, questionId: number, userQuery: string): Promise<string> {
    let foundQuestion = null
    let passageContext = ""

    // Search through sections
    for (const section of testData.sections || []) {
      if (section.type === "standalone" && section.question.id === questionId) {
        foundQuestion = section.question
        break
      } else if (section.type === "passage") {
        const question = section.questions.find((q) => q.id === questionId)
        if (question) {
          foundQuestion = question
          passageContext = `\n\nBÀI ĐỌC LIÊN QUAN:\n${section.passage.title ? `Tiêu đề: ${section.passage.title}\n` : ""}Nội dung: ${section.passage.content}`
          break
        }
      }
    }

    if (!foundQuestion) {
      return "Không tìm thấy câu hỏi này trong bài test."
    }

    const systemPrompt = this.createSystemPrompt(testData)
    const questionContext = `
CÂU HỎI CẦN PHÂN TÍCH:
Câu hỏi: ${foundQuestion.question}
Các lựa chọn: ${foundQuestion.options.join(", ")}
Độ khó: ${foundQuestion.difficulty}${passageContext}

Câu hỏi của học sinh: ${userQuery}
`

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: questionContext },
    ]

    return await this.sendMessage(messages)
  }

  // Trả lời câu hỏi chung về test
  async answerGeneralQuestion(testData: Test, userQuery: string): Promise<string> {
    const systemPrompt = this.createSystemPrompt(testData)

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userQuery },
    ]

    return await this.sendMessage(messages)
  }

  // Kiểm tra API key có hoạt động không
  async testApiKey(): Promise<boolean> {
    try {
      const testMessages: ChatMessage[] = [{ role: "user", content: "Hello" }]
      await this.sendMessage(testMessages)
      return true
    } catch (error) {
      console.error("API Key test failed:", error)
      return false
    }
  }
}

export default new OpenAIService()
