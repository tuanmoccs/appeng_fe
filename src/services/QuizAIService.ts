import { OPENAI_API_KEY } from "../constants/config";

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

class QuizAIService {
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
    if (!this.apiKey.startsWith('sk-')) {
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
      console.error("QuizAI Service Error:", error)
      
      // Xử lý lỗi network
      if (error instanceof TypeError && error.message.includes('fetch')) {
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

  // Kiểm tra API key có hoạt động không
  async testApiKey(): Promise<boolean> {
    try {
      const testMessages: ChatMessage[] = [
        { role: "user", content: "Hello" }
      ]
      await this.sendMessage(testMessages)
      return true
    } catch (error) {
      console.error("API Key test failed:", error)
      return false
    }
  }

  // Parse options từ string JSON hoặc array
  private parseOptions(options: string | string[]): string[] {
    if (Array.isArray(options)) {
      return options
    }
    
    try {
      const parsed = JSON.parse(options)
      return Array.isArray(parsed) ? parsed : [options]
    } catch {
      return [options]
    }
  }

  // Tạo system prompt cho chatbot dựa trên dữ liệu quiz
  createSystemPrompt(quizData: any): string {
    const questionsContext =
      quizData.questions
        ?.map(
          (q: any, index: number) => {
            const parsedOptions = this.parseOptions(q.options)
            return `Câu ${index + 1}: ${q.question}\nCác lựa chọn: ${parsedOptions.join(", ")}`
          }
        )
        .join("\n\n") || ""

    return `Bạn là một AI assistant chuyên về tiếng Anh, hỗ trợ học sinh trong quiz "${quizData.title}".

THÔNG TIN QUIZ:
- Tiêu đề: ${quizData.title}
- Mô tả: ${quizData.description}
- Lesson ID: ${quizData.lesson_id}
- Tổng số câu hỏi: ${quizData.questions?.length || 0}

CÁC CÂU HỎI TRONG QUIZ:
${questionsContext}

VAI TRÒ CỦA BẠN:
1. Giải thích ngữ pháp và từ vựng trong các câu hỏi
2. Hướng dẫn cách làm quiz hiệu quả
3. Giải đáp thắc mắc về nội dung tiếng Anh
4. Đưa ra gợi ý học tập và ghi nhớ từ vựng
5. Có thể trực tiếp đưa ra đáp án đúng, sau khi hướng dẫn cách suy luận mà người dùng vẫn hỏi đáp án đúng là gì

QUY TẮC:
- Trả lời bằng tiếng Việt
- Giải thích rõ ràng, dễ hiểu
- Khuyến khích học sinh tự suy luận
- Đưa ra ví dụ minh họa khi cần thiết
- Tập trung vào việc giải thích từ vựng và ngữ nghĩa`
  }

  // Phân tích câu hỏi cụ thể
  async analyzeQuestion(quizData: any, questionId: number, userQuery: string): Promise<string> {
    const question = quizData.questions?.find((q: any) => q.id === questionId)
    if (!question) {
      return "Không tìm thấy câu hỏi này trong quiz."
    }

    const systemPrompt = this.createSystemPrompt(quizData)
    const parsedOptions = this.parseOptions(question.options)
    
    const questionContext = `
CÂU HỎI CẦN PHÂN TÍCH:
Câu hỏi: ${question.question}
Các lựa chọn: ${parsedOptions.join(", ")}

Câu hỏi của học sinh: ${userQuery}
`

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: questionContext },
    ]

    return await this.sendMessage(messages)
  }

  // Trả lời câu hỏi chung về quiz
  async answerGeneralQuestion(quizData: any, userQuery: string): Promise<string> {
    const systemPrompt = this.createSystemPrompt(quizData)

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userQuery },
    ]

    return await this.sendMessage(messages)
  }
}

export default new QuizAIService()